#!/bin/bash
# deploy-prod.sh - сборка и загрузка всех продакшен образов с авторазвертыванием

set -e

# Конфигурация PROD
IMAGES=(
    "exporteru-web:russian:Dockerfile-russian:main"
    "exporteru-web:english:Dockerfile-english:main"
    "exporteru-web:china:Dockerfile-china:cn"
    "exporteru-web:india:Dockerfile-india:cn"
)

OUTPUT_DIR="${HOME}/Exporteru-prod"
mkdir -p "$OUTPUT_DIR"

# Серверы
MAIN_SERVER="exporteru@exporteru.com"
CN_SERVER="exporteru@cn.exporteru.com"

# Пути к скриптам на серверах
DEPLOY_SCRIPT_MAIN="/home/exporteru/scripts/deploy-prod-auto.sh"
DEPLOY_SCRIPT_CN="/home/exporteru/scripts/deploy-prod-auto.sh"

echo "=== ПРОД развертывание - все образы ==="
echo "Выходная директория: $OUTPUT_DIR"
echo "Основной сервер: $MAIN_SERVER"
echo "Китайский сервер: $CN_SERVER"
echo

# Сборка всех образов
echo "(1) Сборка Docker образов..."
echo

for image_config in "${IMAGES[@]}"; do
    IFS=':' read -r -a parts <<< "$image_config"
    image_name="${parts[0]}:${parts[1]}"
    dockerfile="${parts[2]}"
    server_type="${parts[3]}"
    
    echo "Сборка: $image_name (сервер: $server_type)"
    echo "Dockerfile: $dockerfile"
    docker build . -t "$image_name" -f "$dockerfile"
    echo "✓ $image_name собран успешно"
    echo
done

echo "(2) Экспорт образов в tar-файлы..."
echo

# Группируем файлы по серверам
MAIN_FILES=()
CN_FILES=()

# Экспорт всех образов
for image_config in "${IMAGES[@]}"; do
    IFS=':' read -r -a parts <<< "$image_config"
    image_name="${parts[0]}:${parts[1]}"
    tag="${parts[1]}"
    server_type="${parts[3]}"
    
    output_file="${OUTPUT_DIR}/exporteru-web-${tag}.tar"
    
    echo "Экспорт: $image_name"
    echo "В файл: $output_file"
    
    docker save -o "$output_file" "$image_name"
    
    file_size=$(du -h "$output_file" | cut -f1)
    echo "✓ $image_name экспортирован в $output_file ($file_size)"
    
    if [ "$server_type" = "main" ]; then
        MAIN_FILES+=("$output_file")
    elif [ "$server_type" = "cn" ]; then
        CN_FILES+=("$output_file")
    fi
    echo
done

echo "(3) Создание архивов по серверам..."
echo

MAIN_ARCHIVE=""
CN_ARCHIVE=""

# Создание архива для основного сервера
if [ ${#MAIN_FILES[@]} -gt 0 ]; then
    MAIN_ARCHIVE="${OUTPUT_DIR}/exporteru-main-$(date +%Y%m%d_%H%M%S).tar.gz"
    echo "Создание архива для основного сервера..."
    
    main_filenames=()
    for file in "${MAIN_FILES[@]}"; do
        main_filenames+=("$(basename "$file")")
    done
    
    tar -czf "$MAIN_ARCHIVE" -C "$OUTPUT_DIR" "${main_filenames[@]}"
    main_size=$(du -h "$MAIN_ARCHIVE" | cut -f1)
    echo "✓ Архив для основного сервера: $MAIN_ARCHIVE ($main_size)"
    echo
fi

# Создание архива для китайского сервера
if [ ${#CN_FILES[@]} -gt 0 ]; then
    CN_ARCHIVE="${OUTPUT_DIR}/exporteru-cn-$(date +%Y%m%d_%H%M%S).tar.gz"
    echo "Создание архива для китайского сервера..."
    
    cn_filenames=()
    for file in "${CN_FILES[@]}"; do
        cn_filenames+=("$(basename "$file")")
    done
    
    tar -czf "$CN_ARCHIVE" -C "$OUTPUT_DIR" "${cn_filenames[@]}"
    cn_size=$(du -h "$CN_ARCHIVE" | cut -f1)
    echo "✓ Архив для китайского сервера: $CN_ARCHIVE ($cn_size)"
    echo
fi

echo "(4) Загрузка архивов на серверы..."
echo

MAIN_UPLOAD_SUCCESS=false
CN_UPLOAD_SUCCESS=false

# Загрузка на основной сервер
if [ -f "$MAIN_ARCHIVE" ]; then
    echo "Загрузка на основной сервер: $MAIN_SERVER"
    scp "$MAIN_ARCHIVE" "$MAIN_SERVER:~/"
    if [ $? -eq 0 ]; then
        echo "✓ Основной архив загружен"
        MAIN_UPLOAD_SUCCESS=true
    else
        echo "✗ Ошибка при загрузке на основной сервер"
    fi
    echo
fi

# Загрузка на китайский сервер
if [ -f "$CN_ARCHIVE" ]; then
    echo "Загрузка на китайский сервер: $CN_SERVER"
    scp "$CN_ARCHIVE" "$CN_SERVER:~/"
    if [ $? -eq 0 ]; then
        echo "✓ Китайский архив загружен"
        CN_UPLOAD_SUCCESS=true
    else
        echo "✗ Ошибка при загрузке на китайский сервер"
    fi
    echo
fi

echo "(5) Автоматическое развертывание на серверах..."
echo

# Функция для запуска развертывания
run_deployment() {
    local server="$1"
    local script_path="$2"
    local server_name="$3"
    
    echo "Запуск авторазвертывания на $server_name..."
    
    # Проверяем доступность SSH
    if ! ssh -o ConnectTimeout=5 "$server" "echo 'SSH connection successful'" > /dev/null 2>&1; then
        echo "  ⚠ Не удалось подключиться к $server_name"
        return 1
    fi
    
    # Проверяем наличие скрипта
    if ! ssh "$server" "[ -f $script_path ] && echo 'Script found'" > /dev/null 2>&1; then
        echo "  ⚠ Скрипт не найден: $script_path"
        echo "  Создайте скрипт на сервере или выполните развертывание вручную"
        return 1
    fi
    
    # Проверяем права на выполнение
    if ! ssh "$server" "[ -x $script_path ] && echo 'Script executable'" > /dev/null 2>&1; then
        echo "  ⚠ Скрипт не исполняемый, добавляем права..."
        ssh "$server" "sudo chmod +x $script_path"
    fi
    
    # Запускаем скрипт
    echo "  Запуск $script_path..."
    ssh -t "$server" "sudo $script_path"
    
    local result=$?
    if [ $result -eq 0 ]; then
        echo "  ✓ Развертывание на $server_name успешно запущено"
        return 0
    else
        echo "  ✗ Ошибка при запуске развертывания на $server_name"
        return 1
    fi
}

# Запуск развертывания на основном сервере
if [ "$MAIN_UPLOAD_SUCCESS" = true ]; then
    read -p "Запустить авторазвертывание на основном сервере? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        run_deployment "$MAIN_SERVER" "$DEPLOY_SCRIPT_MAIN" "основном сервере"
        MAIN_DEPLOY_RESULT=$?
    else
        echo "  ⏭ Пропущено авторазвертывание на основном сервере"
        echo "  Для ручного развертывания выполните:"
        echo "    ssh $MAIN_SERVER"
        echo "    sudo $DEPLOY_SCRIPT_MAIN"
    fi
fi

echo

# Запуск развертывания на китайском сервере
if [ "$CN_UPLOAD_SUCCESS" = true ]; then
    read -p "Запустить авторазвертывание на китайском сервере? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        run_deployment "$CN_SERVER" "$DEPLOY_SCRIPT_CN" "китайском сервере"
        CN_DEPLOY_RESULT=$?
    else
        echo "  ⏭ Пропущено авторазвертывание на китайском сервере"
        echo "  Для ручного развертывания выполните:"
        echo "    ssh $CN_SERVER"
        echo "    sudo $DEPLOY_SCRIPT_CN"
    fi
fi

echo
echo "=== ПРОД развертывание завершено! ==="
echo
echo "Сводка:"
echo "Архивы созданы в: $OUTPUT_DIR"

if [ -f "$MAIN_ARCHIVE" ]; then
    echo "  Основной сервер: $(basename "$MAIN_ARCHIVE")"
    if [ "$MAIN_UPLOAD_SUCCESS" = true ]; then
        echo "    ✓ Загружен успешно"
    else
        echo "    ✗ Ошибка загрузки"
    fi
fi

if [ -f "$CN_ARCHIVE" ]; then
    echo "  Китайский сервер: $(basename "$CN_ARCHIVE")"
    if [ "$CN_UPLOAD_SUCCESS" = true ]; then
        echo "    ✓ Загружен успешно"
    else
        echo "    ✗ Ошибка загрузки"
    fi
fi

echo
echo "Для ручного развертывания:"
echo "  Основной сервер: ssh $MAIN_SERVER && sudo $DEPLOY_SCRIPT_MAIN"
echo "  Китайский сервер: ssh $CN_SERVER && sudo $DEPLOY_SCRIPT_CN"
