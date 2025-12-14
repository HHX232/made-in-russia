import {TypeRootState, TypeAppDispatch} from '@/store/store'
import {useDispatch, useSelector} from 'react-redux'
import {TypedUseSelectorHook} from 'react-redux'

export const useAppDispatch = () => useDispatch<TypeAppDispatch>()
export const useAppSelector: TypedUseSelectorHook<TypeRootState> = useSelector
