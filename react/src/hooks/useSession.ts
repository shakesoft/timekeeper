import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import type { SessionState } from "../app/slices/sessionSlice";

export const useSession = (): SessionState => {
  const session = useSelector((state: RootState) => state.session);

  return session;
};
