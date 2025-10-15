/* eslint-disable @typescript-eslint/no-unused-vars */
// hooks/api/useVendorApi.ts
import {useMutation, useQueryClient} from '@tanstack/react-query'
import {useActions} from '@/hooks/useActions'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'
import instance from '@/api/api.interceptor'
import {User} from '@/store/User/user.slice'
import {toast} from 'sonner'

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
  address?: string
}

export const useUpdateVendorDetails = () => {
  const queryClient = useQueryClient()
  const {updateVendorDetails} = useActions()
  const currentLang = useCurrentLanguage()

  const translates = {
    ru: {
      loading: 'Обновляем данные поставщика...',
      successTitle: 'Поздравляем!',
      successBody: 'Данные успешно обновлены',
      errorTitle: 'Ошибка при обновлении данных',
      errorPrefix: 'Ошибка – '
    },
    en: {
      loading: 'Updating vendor details...',
      successTitle: 'Success!',
      successBody: 'Vendor details updated successfully',
      errorTitle: 'Failed to update vendor details',
      errorPrefix: 'Error – '
    },
    zh: {
      loading: '正在更新供应商数据...',
      successTitle: '成功！',
      successBody: '供应商数据更新成功',
      errorTitle: '更新供应商数据失败',
      errorPrefix: '错误 – '
    }
  } as const

  const t = translates[currentLang as keyof typeof translates] ?? translates.ru

  // keep id to close loading toast on any outcome
  let loadingId: string | number | undefined

  return useMutation({
    mutationFn: async (payload: VendorUpdatePayload): Promise<User> => {
      loadingId = toast.loading(t.loading)
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
      toast.dismiss()
      return response.data
    },
    onMutate: async (newVendorData) => {
      await queryClient.cancelQueries({queryKey: USER_QUERY_KEY})
      const previousUser = queryClient.getQueryData<User>(USER_QUERY_KEY)

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

      updateVendorDetails(newVendorData)
      return {previousUser}
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any, _variables, context) => {
      toast.dismiss()
      if (loadingId !== undefined) toast.dismiss(loadingId)

      // do not translate server message
      const serverMessage = error?.response?.data?.errors?.message || error?.response?.data?.message

      toast.error(
        <div style={{lineHeight: 1.5}}>
          <strong style={{display: 'block', marginBottom: 4}}>{t.errorTitle}</strong>
          <span>
            {t.errorPrefix}
            {serverMessage || (error as Error).message}
          </span>
        </div>,
        {
          style: {background: '#AC2525'}
        }
      )

      if (context?.previousUser) {
        queryClient.setQueryData(USER_QUERY_KEY, context.previousUser)
        if (context.previousUser.vendorDetails) {
          updateVendorDetails(context.previousUser.vendorDetails)
        }
      }
    },
    onSuccess: () => {
      toast.dismiss()
      if (loadingId !== undefined) toast.dismiss(loadingId)

      toast.success(
        <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
          <strong style={{display: 'block', marginBottom: 4, fontSize: '18px'}}>{t.successTitle}</strong>
          <span>{t.successBody}</span>
        </div>,
        {
          style: {background: '#2E7D32'}
        }
      )
    },
    onSettled: () => {
      if (loadingId !== undefined) toast.dismiss(loadingId)
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
