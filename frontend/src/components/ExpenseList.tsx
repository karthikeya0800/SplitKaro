import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { getCurrencySymbol } from "@/utils/currency";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Square } from "@/components/ui/square";
import { formatDistanceToNow } from "date-fns";
import { Pencil, Trash2, X, Check, Loader2, Loader } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { deleteExpense, updateExpense } from "@/redux/slices/expenseSlice";
import { IExpense, IPaidBy, IPaidFor } from "@/types";
import { logout, toggleShowLogin } from "@/redux/slices/authSlice";

export const ExpenseList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { expenses, expenseLoading } = useSelector(
    (state: RootState) => state.expenses
  );
  const { participants } = useSelector(
    (state: RootState) => state.participants
  );
  // const { user } = useAuth();
  const [editingExpense, setEditingExpense] = useState("");
  const [deletingExpense, setDeletingExpense] = useState(false);
  const [editForm, setEditForm] = useState({
    amount: 0,
    description: "",
    paidBy: { participantId: "", name: "" },
    paidFor: [],
  });

  useEffect(() => {
    const editingExpenseDetails = expenses.find(
      (expense) => expense._id === editingExpense
    );
    if (editingExpenseDetails) {
      setEditForm({
        amount: parseFloat(editingExpenseDetails.amount.toFixed(2)),
        description: editingExpenseDetails.description,
        paidBy: editingExpenseDetails.paidBy,
        paidFor: [...editingExpenseDetails.paidFor],
      });
    }
  }, []);

  const handleDeleteExpense = async (id: string) => {
    try {
      const response = await dispatch(deleteExpense(id)).unwrap();
      toast.success("Expense Deleted");
    } catch (err) {
      if (err.includes("Session Expired")) {
        dispatch(logout());
        toast.error(err);
      }
      console.error(err);
    }
  };

  const handleEdit = (expense: any) => {
    setEditingExpense(expense._id);
    setEditForm({
      amount: expense.amount.toString(),
      description: expense.description,
      paidBy: expense.paidBy,
      paidFor: [...expense.paidFor],
    });
  };

  const handleSaveEdit = async (id: string) => {
    if (
      !editForm.description ||
      !editForm.amount ||
      isNaN(editForm.amount) ||
      editForm.amount <= 0
    ) {
      toast("Please enter valid information");
      return;
    }

    if (!editForm.paidBy.name) {
      toast("Please select who paid");
      return;
    }

    if (editForm.paidFor.length === 0) {
      toast("Please select at least one person who this expense was for");
      return;
    }

    const totalSplitBetween = editForm.paidFor.reduce(
      (total, participant) => total + participant.amount,
      0
    );
    if (
      Math.abs(totalSplitBetween - editForm.amount) >
      0.01 * editForm.paidFor.length
    ) {
      toast(
        totalSplitBetween > editForm.amount
          ? "Total split amount is greater than the total amount"
          : "Total split amount is less than the total amount"
      );
      return;
    }

    try {
      const response = await dispatch(
        updateExpense({
          id,
          data: {
            amount: editForm.amount,
            description: editForm.description,
            paidBy: editForm.paidBy,
            paidFor: editForm.paidFor,
          },
        })
      ).unwrap();

      toast.success("Expense Updated Successfully");
      setEditingExpense(null);
    } catch (err) {
      if (err.includes("Session Expired")) {
        dispatch(logout());
        toast.error(err);
      }
      console.error(err);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and one decimal point
    const value = e.target.value;
    if (value === "" || /^\d+(\.\d{0,2})?$/.test(value)) {
      setEditForm({
        ...editForm,
        amount: parseFloat(value),
      });
    }
  };

  const handleCancel = () => {
    setEditingExpense(null);
  };

  const handleParticipantAmount = (
    paidForObj: IPaidFor,
    participantAmount: string
  ) => {
    const floatAmount = parseFloat(participantAmount);
    setEditForm({
      ...editForm,
      paidFor: editForm.paidFor.map((p) =>
        p.participantId === paidForObj.participantId
          ? { ...p, amount: floatAmount ? floatAmount : 0.0 }
          : p
      ),
    });
  };

  const currencySymbol = user?.currency
    ? getCurrencySymbol(user.currency)
    : "$";

  if (expenses.length === 0) {
    return (
      <div className="text-center h-[65vh] text-muted-foreground p-4">
        No expenses added yet.
      </div>
    );
  }

  return (
    <div className="space-y-3 h-[65vh] overflow-y-scroll">
      {expenseLoading && !editingExpense ? (
        <div className="h-[65vh] flex justify-center items-center">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        [...expenses].reverse().map((expense) => {
          const date = new Date(expense.updatedAt);
          const formattedDate = formatDistanceToNow(date, { addSuffix: true });

          if (editingExpense === expense._id) {
            return (
              <Card key={expense._id} className="expense-card p-4">
                <div className="space-y-3">
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Description"
                    />
                  </div>

                  <div>
                    <Label>Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-muted-foreground">
                        {currencySymbol}
                      </span>
                      <Input
                        value={editForm.amount}
                        onChange={handleAmountChange}
                        className="pl-7"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Paid By</Label>
                    <Select
                      value={editForm.paidBy.name}
                      onValueChange={(value) => {
                        const participant = participants.find(
                          (p) => p.name === value
                        );
                        if (participant) {
                          setEditForm({
                            ...editForm,
                            paidBy: {
                              name: value,
                              participantId: participant._id,
                            },
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select who paid" />
                      </SelectTrigger>
                      <SelectContent className="max-w-[300px]">
                        {participants.map((participant) => (
                          <SelectItem
                            className="overflow-scroll"
                            key={participant.name}
                            value={participant.name}
                          >
                            {participant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 gap-3 max-h-52 overflow-y-scroll p-2">
                    {editForm.paidFor.map((val) => (
                      <div
                        key={val.name}
                        className="flex items-center space-x-2"
                      >
                        <label
                          htmlFor={`paidFor-${val.name}`}
                          className="text-sm font-medium cursor-pointer w-52 overflow-scroll"
                        >
                          {val.name}
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center justify-center pl-3 pointer-events-none">
                            <span className="text-muted-foreground">
                              {currencySymbol}
                            </span>
                          </div>
                          <Input
                            id="amount"
                            type="text"
                            value={val.amount}
                            onChange={(e) =>
                              handleParticipantAmount(val, e.target.value)
                            }
                            className="pl-7 h-8"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 mt-3">
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                      <X size={16} className="mr-1" /> Cancel
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSaveEdit(expense._id)}
                      className="w-20"
                      disabled={expenseLoading}
                    >
                      {expenseLoading ? (
                        <Loader className="animate-spin" />
                      ) : (
                        <>
                          <Check size={16} className="mr-1" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          }

          return (
            <Card key={expense._id} className="expense-card animate-fade-in">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium">{expense.description}</h3>
                  <div className="text-sm text-muted-foreground">
                    {expense.paidBy.name.length > 5
                      ? expense.paidBy.name.substring(0, 5) + "..."
                      : expense.paidBy.name}{" "}
                    paid • updated {formattedDate}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Split with:{" "}
                    {expense.paidFor
                      .map((participant) =>
                        participant.name.length > 5
                          ? participant.name.substring(0, 5) + "..."
                          : participant.name
                      )
                      .join(", ")}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-semibold">
                    {currencySymbol}
                    {expense.amount.toFixed(2)}
                  </span>
                  <div className="flex gap-1 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs hover:text-accent-foreground"
                      onClick={() => handleEdit(expense)}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-destructive hover:text-destructive"
                      disabled={expenseLoading}
                      onClick={() => handleDeleteExpense(expense._id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
};
