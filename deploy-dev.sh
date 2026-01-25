#!/bin/bash
# deploy-dev.sh - сборка и загрузка только тестового образа

set -e

# Конфигурация
IMAGES=(
    "exporteru-web:test:Dockerfile-test:main"
)

OUTPUT_DIR="${HOME}/Exporteru-dev"
mkdir -p "$OUTPUT_DIR"

# Серверы
MAIN_SERVER="exporteru@exporteru.com"

echo "=== Сборка и загрузка DEV образа ==="
echo "Выходная директория: $OUTPUT_DIR"
echo "Сервер: $MAIN_SERVER"
echo

# Сборка тестового образа
echo "(1) Сборка Docker образа test..."
echo

for image_config in "${IMAGES[@]}"; do
    IFS=':' read -r -a parts <<< "$image_config"
    image_name="${parts[0]}:${parts[1]}"
    dockerfile="${parts[2]}"
    server_type="${parts[3]}"
    
    echo "Сборка: $image_name"
    echo "Dockerfile: $dockerfile"
    docker build . -t "$image_name" -f "$dockerfile"
    echo "✓ $image_name собран успешно"
    echo
done

echo "(2) Экспорт образа в tar-файл..."
echo

for image_config in "${IMAGES[@]}"; do
    IFS=':' read -r -a parts <<< "$image_config"
    image_name="${parts[0]}:${parts[1]}"
    tag="${parts[1]}"
    
    output_file="${OUTPUT_DIR}/exporteru-web-${tag}.tar"
    
    echo "Экспорт: $image_name"
    echo "В файл: $output_file"
    
    docker save -o "$output_file" "$image_name"
    
    file_size=$(du -h "$output_file" | cut -f1)
    echo "✓ $image_name экспортирован в $output_file ($file_size)"
    echo
done

echo "(3) Создание архива..."
echo

TEST_ARCHIVE="${OUTPUT_DIR}/exporteru-test-$(date +%Y%m%d_%H%M%S).tar.gz"
tar -czf "$TEST_ARCHIVE" -C "$OUTPUT_DIR" $(basename "$OUTPUT_DIR"/exporteru-web-*.tar)
test_size=$(du -h "$TEST_ARCHIVE" | cut -f1)

echo "✓ Архив для тестового сервера: $TEST_ARCHIVE ($test_size)"
echo

echo "(4) Загрузка архива на основной сервер..."
echo

if [ -f "$TEST_ARCHIVE" ]; then
    echo "Загрузка на основной сервер: $MAIN_SERVER"
    scp "$TEST_ARCHIVE" "$MAIN_SERVER:~/"
    if [ $? -eq 0 ]; then
        echo "✓ Архив успешно загружен на основной сервер"
        
        # Опционально: отправляем команду на развертывание
        echo "Отправка команды на развертывание тестового образа..."
        ssh "$MAIN_SERVER" "/home/exporteru/scripts/deploy-dev-auto.sh"
    else
        echo "✗ Ошибка при загрузке"
    fi
    echo
fi

echo "=== DEV развертывание завершено! ==="
echo "Архив создан: $TEST_ARCHIVE"
