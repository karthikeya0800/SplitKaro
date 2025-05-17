import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Square } from "@/components/ui/square";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { CurrencyIcon, getCurrencySymbol } from "@/utils/currency";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { IPaidBy, IPaidFor } from "@/types";
import { createExpense } from "@/redux/slices/expenseSlice";
import { logout, toggleShowLogin } from "@/redux/slices/authSlice";

export const ExpenseForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { participants } = useSelector(
    (state: RootState) => state.participants
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [paidBy, setPaidBy] = useState<IPaidBy>();
  const [paidFor, setPaidFor] = useState<IPaidFor[]>([]);
  const [splitBetween, setSplitBetween] = useState<IPaidFor[]>([]);
  const [submitExpenseLoading, setSubmitExpenseLoading] = useState(false);

  useEffect(() => {
    const initialPaidFor = participants.map((participant) => ({
      participantId: participant._id,
      name: participant.name,
      amount: 0,
    }));
    setPaidFor(initialPaidFor);
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and one decimal point
    const value = e.target.value;
    if (value === "" || /^\d+(\.\d{0,2})?$/.test(value)) {
      setAmount(value ? parseFloat(value) : 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || amount <= 0) {
      toast("Please enter a valid amount");
      return;
    }

    if (!description) {
      toast("Please enter a description");
      return;
    }

    if (!paidBy) {
      toast("Please select who paid");
      return;
    }

    if (splitBetween.length === 0) {
      toast("Please select at least one person who this expense was for");
      return;
    }

    const totalSplitBetween = splitBetween.reduce(
      (total, participant) => total + participant.amount,
      0
    );
    console.log(`totalSplitBetween ${totalSplitBetween} amount--${amount}`);
    if (Math.abs(totalSplitBetween - amount) > 0.01 * splitBetween.length) {
      toast(
        totalSplitBetween > amount
          ? "Total split amount is greater than the total amount"
          : "Total split amount is less than the total amount"
      );
      return;
    }

    try {
      setSubmitExpenseLoading(true);
      const response = await dispatch(
        createExpense({
          amount: amount,
          description,
          paidBy,
          paidFor,
          date: new Date().toISOString().split("T")[0],
        })
      ).unwrap();

      // Reset form
      setAmount(0);
      setDescription("");
      setSplitBetween([]);
      setPaidBy(null);
      setPaidFor(paidFor.map((participant) => ({ ...participant, amount: 0 })));
      toast.success(`Expense added successfully`);
    } catch (err) {
      if (err.includes("Session Expired")) {
        dispatch(logout());
        toast.error(err);
      }
      console.error(err);
    }
    setSubmitExpenseLoading(false);
  };

  const handleSplitAmount = () => {
    const totalParticipants = splitBetween.length;
    const amountPerParticipant = (amount / totalParticipants).toFixed(2);
    console.log(
      `amount in splitamount ---- ${amount} amountPerParticipant -- ${amountPerParticipant}`
    );

    setSplitBetween(
      splitBetween.map((participant) => ({
        ...participant,
        amount: parseFloat(amountPerParticipant),
      }))
    );

    setPaidFor(
      paidFor.map((participant) => ({
        ...participant,
        amount: splitBetween.find(
          (p) => p.participantId === participant.participantId
        )
          ? parseFloat(amountPerParticipant)
          : 0,
      }))
    );
  };

  const handleSplitBetween = (paidForObj: IPaidFor, checked: boolean) => {
    if (checked) {
      if (
        splitBetween.some(
          (item) => item.participantId === paidForObj.participantId
        )
      ) {
        setSplitBetween(
          splitBetween.map((item) =>
            item.participantId === paidForObj.participantId ? paidForObj : item
          )
        );
      } else {
        setSplitBetween([...splitBetween, paidForObj]);
      }
    } else {
      setSplitBetween(
        splitBetween.filter((val) => val.name !== paidForObj.name)
      );
      setPaidFor(
        paidFor.map((participant) =>
          participant.participantId === paidForObj.participantId
            ? { ...participant, amount: 0 }
            : participant
        )
      );
    }
  };

  const handlePaidByChange = (name: String) => {
    const selectedParticipant = participants.find((p) => p.name === name);
    if (selectedParticipant) {
      setPaidBy({
        participantId: selectedParticipant._id,
        name: selectedParticipant.name,
      });
    } else {
      // Optional: Reset paidBy if no participant is found
      setPaidBy({ participantId: "", name: "" });
    }
  };

  const handleSelectAllParticipants = () => {
    if (splitBetween.length === participants.length) {
      // If all are selected, deselect all
      setSplitBetween([]);
      setPaidFor(paidFor.map((participant) => ({ ...participant, amount: 0 })));
    } else {
      // Otherwise select all
      setSplitBetween([
        ...splitBetween,
        ...participants
          .filter((p) => !splitBetween.some((sb) => sb.participantId === p._id))
          .map((p) => ({
            participantId: p._id,
            name: p.name,
            amount: 0,
          })),
      ]);
    }
  };

  const handleParticipantAmount = async (
    paidForObj: IPaidFor,
    participantAmount: string
  ) => {
    const floatAmount = parseFloat(participantAmount);
    const existingPaidFor = splitBetween.find(
      (participant) => participant.participantId === paidForObj.participantId
    );
    if (!existingPaidFor) {
      setSplitBetween([...splitBetween, paidForObj]);
    } else {
      setSplitBetween(
        splitBetween.map((participant) =>
          participant.participantId === paidForObj.participantId
            ? { ...participant, amount: floatAmount }
            : participant
        )
      );
    }

    setPaidFor(
      paidFor.map((p) =>
        p.participantId === paidForObj.participantId
          ? { ...p, amount: floatAmount ? floatAmount : 0 }
          : p
      )
    );
  };

  const currencySymbol = user?.currency
    ? getCurrencySymbol(user.currency)
    : "₹";

  return (
    <Card className="form-container animate-slide-up">
      <h2 className="text-xl font-bold mb-4 text-center">Add Expense</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center justify-center pl-3 pointer-events-none">
                <span className="text-muted-foreground">{currencySymbol}</span>
              </div>
              <Input
                id="amount"
                type="text"
                value={amount ? amount : ""}
                onChange={handleAmountChange}
                className="pl-7"
                placeholder="0"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">For What</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Dinner, Taxi, etc."
              required
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <Label>Paid By</Label>
          </div>
          <Select
            value={paidBy?.name ? paidBy.name : ""}
            onValueChange={(selectedName) => handlePaidByChange(selectedName)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select who paid" />
            </SelectTrigger>
            <SelectContent className="max-h-52 max-w-[300px]">
              {participants.map((val) => (
                <SelectItem
                  className="overflow-scroll"
                  key={val._id}
                  value={val.name}
                >
                  {val.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <Label className="block">Split With</Label>
            <div className="flex space-x-2">
              <div className="flex justify-center items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleSplitAmount();
                  }}
                  className="text-xs h-7 active:scale-95 transition-transform duration-100"
                  disabled={splitBetween.length === 0 || !amount}
                >
                  Split Equally
                </Button>
              </div>
              <div className="flex justify-center items-center">
                <label className="text-sm font-medium cursor-pointer">
                  Select All
                </label>
                <Square
                  onClick={handleSelectAllParticipants}
                  checked={splitBetween.length === participants.length}
                  className="ml-2"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 max-h-52 overflow-y-scroll p-2">
            {paidFor.map((val) => (
              <div key={val.name} className="flex items-center space-x-2">
                <Square
                  id={`paidFor-${val.name}`}
                  checked={splitBetween.some(
                    (record) => record.name === val.name
                  )}
                  onCheckedChange={(checked) =>
                    handleSplitBetween(
                      {
                        participantId: val.participantId,
                        name: val.name,
                        amount: val.amount,
                      },
                      checked === true
                    )
                  }
                />
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
                    value={val.amount ? val.amount : ""}
                    onChange={(e) =>
                      handleParticipantAmount(val, e.target.value)
                    }
                    className="pl-7 h-8"
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-expense hover:bg-expense-dark"
          disabled={submitExpenseLoading}
        >
          {submitExpenseLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            "Add Expense"
          )}
        </Button>
      </form>
    </Card>
  );
};
