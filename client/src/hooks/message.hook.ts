import { useSnackbar } from 'notistack'

export const useMessage = () => {
  const { enqueueSnackbar } = useSnackbar()
  const message: any = (msg: string) => enqueueSnackbar(msg)
  return { message }
}
