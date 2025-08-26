// hooks/api/useVendorApi.ts
import {useMutation, useQueryClient} from '@tanstack/react-query'
import {useActions} from '@/hooks/useActions'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'
import instance from '@/api/api.interceptor'
import {User} from '@/store/User/user.slice'

const USER_QUERY_KEY = ['user'] as const

// PATCH интерфейс для обновления vendor данных
interface VendorUpdatePayload {
  phoneNumber?: string
  region?: string
  inn?: string
  description?: string
  sites?: string[]
  countries?: {name: string; value: string}[]
  categories?: string[]
  phoneNumbers?: string[]
  emails?: string[]
}

// Hook для обновления vendor данных
export const useUpdateVendorDetails = () => {
  const queryClient = useQueryClient()
  const {updateVendorDetails} = useActions()
  const currentLang = useCurrentLanguage()

  return useMutation({
    mutationFn: async (payload: VendorUpdatePayload): Promise<User> => {
      console.log('payload', payload)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {region, ...rest} = payload
      const response = await instance.patch<User>(
        '/me',
        {...rest, countries: payload.countries?.map((country) => country?.name)},
        {
          headers: {
            'Accept-Language': currentLang
          }
        }
      )
      return response.data
    },
    onMutate: async (newVendorData) => {
      // Отменяем исходящие запросы для пользователя
      await queryClient.cancelQueries({queryKey: USER_QUERY_KEY})

      // Получаем предыдущие данные для rollback
      const previousUser = queryClient.getQueryData<User>(USER_QUERY_KEY)

      // Optimistically обновляем кэш
      queryClient.setQueryData<User>(USER_QUERY_KEY, (oldUser) => {
        if (!oldUser) return oldUser

        return {
          ...oldUser,
          vendorDetails: {
            ...oldUser.vendorDetails,
            ...newVendorData
          }
        }
      })

      // Также обновляем Redux store
      updateVendorDetails(newVendorData)

      return {previousUser}
    },
    onError: (error, variables, context) => {
      // Откатываем изменения при ошибке
      if (context?.previousUser) {
        queryClient.setQueryData(USER_QUERY_KEY, context.previousUser)

        // Откатываем Redux store
        if (context.previousUser.vendorDetails) {
          updateVendorDetails(context.previousUser.vendorDetails)
        }
      }
    },
    onSettled: () => {
      // Перезагружаем данные пользователя для синхронизации
      queryClient.invalidateQueries({queryKey: USER_QUERY_KEY})
    }
  })
}

// Hook для обновления отдельных полей vendor
export const useUpdateVendorField = () => {
  const updateVendorDetails = useUpdateVendorDetails()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateField = (field: keyof VendorUpdatePayload, value: any) => {
    updateVendorDetails.mutate({[field]: value})
  }

  return {
    updateField,
    isLoading: updateVendorDetails.isPending,
    error: updateVendorDetails.error
  }
}

// Hook для массового обновления vendor данных
export const useBulkUpdateVendor = () => {
  const updateVendorDetails = useUpdateVendorDetails()

  const bulkUpdate = (updates: Partial<VendorUpdatePayload>) => {
    updateVendorDetails.mutate(updates)
  }

  return {
    bulkUpdate,
    isLoading: updateVendorDetails.isPending,
    error: updateVendorDetails.error,
    isSuccess: updateVendorDetails.isSuccess
  }
}
