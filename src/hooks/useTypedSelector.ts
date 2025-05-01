import { TypeRootState } from "@/store/store";
import { useSelector } from "react-redux";
import { TypedUseSelectorHook } from "react-redux";

export const useTypedSelector:TypedUseSelectorHook<TypeRootState> = useSelector