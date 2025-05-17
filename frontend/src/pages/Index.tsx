import { AuthWrapper } from "@/components/AuthWrapper";
import { ExpenseDashboard } from "@/components/ExpenseDashboard";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const Index = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <>
      {user?.email ? <ExpenseDashboard /> : <AuthWrapper />}
    </>
  );
};

export default Index;
