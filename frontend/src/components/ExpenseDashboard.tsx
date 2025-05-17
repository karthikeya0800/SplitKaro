import { useState } from "react";
import { ExpenseForm } from "./ExpenseForm";
import { ExpenseList } from "./ExpenseList";
import { ExpenseSummary } from "./ExpenseSummary";
import { Header } from "./Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  ArrowRightLeft,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  UserPlus,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import {
  createMultipleParticipants,
  readParticipants,
} from "@/redux/slices/participantSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { IParticipant } from "@/types";
import { readExpenses } from "@/redux/slices/expenseSlice";
import { logout, toggleShowLogin } from "@/redux/slices/authSlice";
import Footer from "./Footer";

export const ExpenseDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { participants, participantLoading } = useSelector(
    (state: RootState) => state.participants
  );
  const hasParticipants = participants?.length > 0;
  const [newParticipant, setNewParticipant] = useState("");
  const [initialParticipants, setInitialParticipants] = useState<
    Partial<IParticipant>[]
  >([]);
  const [editingParticipant, setEditingParticipant] = useState([false, 0]);

  const addInitialParticipants = () => {
    if (initialParticipants.some((record) => record.name === newParticipant)) {
      toast(`${newParticipant} already exists`);
      return;
    }
    setInitialParticipants([...initialParticipants, { name: newParticipant }]);
    setNewParticipant("");
  };

  const submitInitialParticipants = async () => {
    try {
      const response = await dispatch(
        createMultipleParticipants(initialParticipants)
      ).unwrap();
      toast.success("Participants Added Successfully");
      setInitialParticipants([]);
    } catch (err) {
      if (err.includes("Session Expired")) {
        dispatch(logout());
        toast.error(err);
      }
      console.error(err);
    }
  };

  const removeInitialParticipant = (name: string) => {
    setInitialParticipants(initialParticipants.filter((p) => p.name !== name));
  };

  const editInitialParticipant = (name: string, index: number) => {
    setEditingParticipant([true, index]);
    setNewParticipant(name);
  };

  const updateInitialParticipants = () => {
    setInitialParticipants(
      initialParticipants.map((p, i) =>
        i === editingParticipant[1] ? { name: newParticipant } : p
      )
    );
    setNewParticipant("");
    setEditingParticipant([false, 0]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-md mx-auto">
        <Header />
        {participantLoading ? (
          <Loader2 className="mx-auto my-[25vh] animate-spin" />
        ) : hasParticipants ? (
          <Tabs defaultValue="add" className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="add" className="flex-1">
                Add Expense
              </TabsTrigger>
              <TabsTrigger value="list" className="flex-1">
                Expenses
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex-1">
                Summary
              </TabsTrigger>
            </TabsList>

            <TabsContent value="add">
              <ExpenseForm />
            </TabsContent>

            <TabsContent value="list">
              <Card className="form-container">
                <h2 className="text-xl font-bold mb-4 text-center">
                  Your Expenses
                </h2>
                <ExpenseList />
              </Card>
            </TabsContent>

            <TabsContent value="summary">
              <ExpenseSummary />
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="p-6 form-container animate-slide-up">
            <h2 className="text-xl font-bold mb-4 text-center">
              Welcome to Split Karo <br /> Expense Tracker
            </h2>
            <p className="text-center mb-6">
              Start by adding participants to your trip
            </p>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2">
                <Input
                  value={newParticipant}
                  onChange={(e) => setNewParticipant(e.target.value)}
                  placeholder="Participant name"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (!newParticipant) {
                        return;
                      }
                      editingParticipant[0]
                        ? updateInitialParticipants()
                        : addInitialParticipants();
                    }
                  }}
                />
                <Button
                  onClick={
                    editingParticipant[0]
                      ? updateInitialParticipants
                      : addInitialParticipants
                  }
                  disabled={!newParticipant}
                  className="bg-expense hover:bg-expense-dark whitespace-nowrap"
                >
                  {editingParticipant[0] ? (
                    "Update"
                  ) : (
                    <>
                      <UserPlus size={18} className="mr-2" /> Add
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
              {initialParticipants.map((val, index) => (
                <div
                  key={val.name}
                  className="flex justify-between items-center p-2 bg-secondary rounded-md"
                >
                  <span className="w-52 overflow-scroll">{val.name}</span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => editInitialParticipant(val.name, index)}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => removeInitialParticipant(val.name)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={() => {
                submitInitialParticipants();
              }}
              disabled={initialParticipants.length === 0}
              className="w-full mt-6 bg-expense hover:bg-expense-dark"
            >
              <ArrowRight size={20} className="mr-2" /> Proceed
            </Button>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  );
};
