import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown, ChevronUp, Info } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCurrencySymbol } from "@/utils/currency";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export const ExpenseSummary: React.FC = () => {
  const { expenses } = useSelector((state: RootState) => state.expenses);
  const { user } = useSelector((state: RootState) => state.auth);
  const { participants } = useSelector(
    (state: RootState) => state.participants
  );
  const [selectedDetails, setSelectedDetails] = useState<{
    from: string;
    to: string;
    expenses: any[];
  } | null>(null);
  const [summary, setSummary] = useState<
    { from: string; to: string; amount: number }[]
  >([]);

  // Generate a detailed matrix of who owes whom
  const generateDetailedMatrix = () => {
    // Initialize the matrix with all participants
    const matrix: Record<
      string,
      Record<string, { amount: number; expenses: any[] }>
    > = {};

    participants.forEach((p1) => {
      matrix[p1.name] = {};
      participants.forEach((p2) => {
        // if (p1 !== p2) {
        matrix[p1.name][p2.name] = { amount: 0, expenses: [] };
        // }
      });
    });

    // Fill the matrix based on expenses
    expenses.forEach((expense) => {
      const { paidBy, paidFor, amount, description, _id, date } = expense;
      // const amountPerPerson = amount / paidFor.length;

      // For each participant who benefited
      paidFor.forEach((beneficiary) => {
        // if (beneficiary !== paidBy) {
        // The beneficiary owes the payer
        matrix[beneficiary.name][paidBy.name].amount += beneficiary.amount;
        matrix[beneficiary.name][paidBy.name].expenses.push({
          _id,
          description,
          amount: beneficiary.amount,
          totalAmount: amount,
          paidBy,
          date,
          expenseId: _id,
        });
        // }
      });
    });
    return matrix;
  };

  const detailedMatrix = generateDetailedMatrix();

  // const calculateSummary = () => {
  //   // Skip if no participants or expenses
  //   if (participants.length === 0 || expenses.length === 0) {
  //     setSummary([]);
  //     return;
  //   }

  //   // Calculate what each person has paid and what they owe
  //   const balances: Record<string, number> = {};
  //   participants.forEach((p) => (balances[p.name] = 0));

  //   // Process each expense
  //   expenses.forEach((expense) => {
  //     const payer = expense.paidBy.name;
  //     // const splitAmount = expense.amount / expense.paidFor.length;

  //     // Add the full amount to what the payer has paid
  //     balances[payer] += expense.amount;

  //     // Subtract the split amount from each person who benefited
  //     expense.paidFor.forEach((person) => {
  //       balances[person.name] -= person.amount;
  //     });
  //   });

  //   // Determine who owes whom
  //   const debts: { from: string; to: string; amount: number }[] = [];

  //   // Find people with negative balances (they owe money)
  //   const debtors = Object.entries(balances)
  //     .filter(([_, balance]) => balance < 0)
  //     .map(([person, balance]) => ({ person, balance: Math.abs(balance) }));

  //   // Find people with positive balances (they are owed money)
  //   const creditors = Object.entries(balances)
  //     .filter(([_, balance]) => balance > 0)
  //     .map(([person, balance]) => ({ person, balance }));

  //   // Match debtors to creditors
  //   debtors.forEach((debtor) => {
  //     let remainingDebt = debtor.balance;

  //     for (let i = 0; i < creditors.length && remainingDebt > 0.01; i++) {
  //       if (creditors[i].balance <= 0) continue;

  //       // Determine how much of this debt can be paid to this creditor
  //       const paymentAmount = Math.min(remainingDebt, creditors[i].balance);

  //       // Round to 2 decimal places
  //       const roundedAmount = Math.round(paymentAmount * 100) / 100;

  //       if (roundedAmount > 0) {
  //         debts.push({
  //           from: debtor.person,
  //           to: creditors[i].person,
  //           amount: roundedAmount,
  //         });
  //       }

  //       // Update remaining amounts
  //       remainingDebt -= paymentAmount;
  //       creditors[i].balance -= paymentAmount;
  //     }
  //   });
  //   return debts;
  // };

  const calculateSummary = () => {
    const summary: { from: string; to: string; amount: number }[] = [];
    Object.entries(detailedMatrix).forEach(([to, fromMatrix]) => {
      Object.entries(fromMatrix).forEach(([from, details]) => {
        const amount = detailedMatrix[from][to].amount - details.amount;
        if (amount > 0) {
          summary.push({
            from,
            to,
            amount: amount,
          });
        }
      });
    });
    return summary;
  };
  useEffect(() => {
    setSummary(calculateSummary());
  }, []);

  const totalSpent = expenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );
  const currencySymbol = user?.currency
    ? getCurrencySymbol(user.currency)
    : "₹";

  // Show detailed expenses between two participants
  const showExpenseDetails = (from: string, to: string) => {
    setSelectedDetails({
      from,
      to,
      expenses: detailedMatrix[from][to].expenses,
    });
  };

  return (
    <Card className="form-container animate-slide-up overflow-scroll">
      <h2 className="text-xl font-bold mb-4 text-center">Trip Summary</h2>

      <div className="text-center mb-6">
        <div className="text-muted-foreground text-sm">Total Trip Expenses</div>
        <div className="text-3xl font-bold text-expense-dark">
          {currencySymbol}
          {totalSpent.toFixed(2)}
        </div>
      </div>

      {summary?.length > 0 && (
        <div className="space-y-3 mt-6 ">
          <h3 className="font-medium text-center">Settlement Plan</h3>
          <div className="max-h-[20vh] overflow-scroll space-y-3">
            {summary?.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-secondary rounded-lg"
              >
                <span className="w-28 overflow-scroll">{item.from}</span>
                <div className="flex items-center">
                  <span className="text-expense-dark font-medium w-16 overflow-scroll">
                    {currencySymbol}
                    {item.amount}
                  </span>
                  <ArrowRight size={16} className="mx-2 text-expense" />
                  <span className="w-28 overflow-scroll">{item.to}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {participants.length > 1 && (
        <Accordion type="single" collapsible className="space-y-2 mt-6">
          <h3 className="font-medium text-center mb-2">Who Owes Who</h3>
          <div className="max-h-[20vh] overflow-scroll space-y-3">
            {participants.map((person, index) => (
              <AccordionItem
                key={person._id}
                value={`person-${index}`}
                className="border-0"
              >
                <AccordionTrigger className="py-3 px-4 rounded-lg bg-secondary hover:no-underline hover:bg-secondary/80">
                  <span className="text-lg font-medium  w-52 overflow-scroll text-left">
                    {person.name}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-0 max-w-[90vw]">
                  <div className="space-y-2">
                    {[
                      person,
                      ...participants.filter((p) => p.name !== person.name),
                    ]
                      // .filter(otherPerson.name => otherPerson.name !== person.name)
                      .map((otherPerson) => {
                        const owes =
                          detailedMatrix[person.name][otherPerson.name];
                        const isOwed =
                          detailedMatrix[otherPerson.name][person.name];
                          if (
                            (!owes || owes.amount === 0) &&
                            (!isOwed || isOwed.amount === 0)
                          ) {
                            return (
                              <div
                                key={otherPerson.name}
                                className="flex justify-between p-2 bg-secondary/50 rounded-lg overflow-scroll"
                              >
                                <span className="mr-2 overflow-scroll">{otherPerson.name}</span>
                                <span className="text-muted-foreground text-nowrap">
                                  No transactions
                                </span>
                              </div>
                            );
                          }
                        if (otherPerson.name === person.name) {
                          return (
                            <div
                              key={otherPerson.name}
                              className="flex justify-between items-center p-2 bg-secondary/50 rounded-lg"
                            >
                              <span className=" w-52 overflow-scroll">
                                {otherPerson.name}
                              </span>
                              <div className="flex items-center gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-expense-dark"
                                      onClick={() =>
                                        showExpenseDetails(
                                          person.name,
                                          otherPerson.name
                                        )
                                      }
                                    >
                                      <div className="flex justify-center items-center max-w-24 overflow-scroll">
                                        <span>{currencySymbol}</span>
                                        <span>
                                          {owes.amount.toFixed(2)}
                                        </span>{" "}
                                        <Info
                                          size={14}
                                          className="ml-1 inline-block"
                                        />
                                      </div>
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[600px]">
                                    <DialogHeader>
                                      <DialogTitle>
                                        {person.name.length > 10
                                          ? person.name.substring(0, 10) + "..."
                                          : person.name}
                                        's Personal Expenses
                                      </DialogTitle>
                                    </DialogHeader>
                                    <div className="overflow-auto max-h-[400px]">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Description</TableHead>
                                            <TableHead>TotalAmount</TableHead>
                                            <TableHead>Share</TableHead>
                                            <TableHead>Date</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {selectedDetails?.expenses.map(
                                            (exp, i) => (
                                              <TableRow key={i}>
                                                <TableCell>
                                                  {exp.description}
                                                </TableCell>
                                                <TableCell>
                                                  {currencySymbol}
                                                  {exp.totalAmount.toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                  {currencySymbol}
                                                  {exp.amount.toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                  {new Date(
                                                    exp.date
                                                  ).toLocaleDateString()}
                                                </TableCell>
                                              </TableRow>
                                            )
                                          )}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                          );
                        }
                        // if (
                        //   (!owes || owes.amount === 0) &&
                        //   (!isOwed || isOwed.amount === 0)
                        // ) {
                        //   return (
                        //     <div
                        //       key={otherPerson.name}
                        //       className="flex justify-between p-2 bg-secondary/50 rounded-lg overflow-scroll"
                        //     >
                        //       <span className="mr-2 overflow-scroll">{otherPerson.name}</span>
                        //       <span className="text-muted-foreground text-nowrap">
                        //         No transactions
                        //       </span>
                        //     </div>
                        //   );
                        // }

                        return (
                          <div
                            key={otherPerson.name}
                            className="flex justify-between items-center p-2 bg-secondary/50 rounded-lg"
                          >
                            <span className="mr-2 overflow-scroll">
                              {otherPerson.name}
                            </span>
                            <div className="flex items-center gap-2">
                              {owes && owes.amount > 0 && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-orange-600"
                                      onClick={() =>
                                        showExpenseDetails(
                                          person.name,
                                          otherPerson.name
                                        )
                                      }
                                    >
                                      <div className="flex justify-center items-center max-w-24 overflow-scroll">
                                        <span>{currencySymbol}</span>
                                        <span>
                                          {owes.amount.toFixed(2)}
                                        </span>{" "}
                                        <Info
                                          size={14}
                                          className="ml-1 inline-block"
                                        />
                                      </div>
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[600px]">
                                    <DialogHeader>
                                      <DialogTitle>
                                        {person.name.length > 10
                                          ? person.name.substring(0, 10) + "..."
                                          : person.name}{" "}
                                        pays{" "}
                                        {otherPerson.name.length > 10
                                          ? otherPerson.name.substring(0, 10) +
                                            "..."
                                          : otherPerson.name}{" "}
                                      </DialogTitle>
                                    </DialogHeader>
                                    <div className="overflow-auto max-h-[400px]">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Total Amount</TableHead>
                                            <TableHead>Share</TableHead>
                                            <TableHead>Date</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {selectedDetails?.expenses.map(
                                            (exp, i) => (
                                              <TableRow key={i}>
                                                <TableCell>
                                                  {exp.description}
                                                </TableCell>
                                                <TableCell>
                                                  {currencySymbol}
                                                  {exp.totalAmount.toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                  {currencySymbol}
                                                  {exp.amount.toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                  {new Date(
                                                    exp.date
                                                  ).toLocaleDateString()}
                                                </TableCell>
                                              </TableRow>
                                            )
                                          )}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}

                              {isOwed && isOwed.amount > 0 && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-green-600 max-w-24 overflow-scroll"
                                      onClick={() =>
                                        showExpenseDetails(
                                          otherPerson.name,
                                          person.name
                                        )
                                      }
                                    >
                                      <div className="flex justify-center items-center max-w-24 overflow-scroll">
                                        <span className="inline-block">
                                          {currencySymbol}
                                        </span>
                                        <span className="inline-block">
                                          {isOwed.amount.toFixed(2)}
                                        </span>{" "}
                                        <Info
                                          size={14}
                                          className="ml-1 inline-block"
                                        />
                                      </div>
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[600px]">
                                    <DialogHeader>
                                      <DialogTitle>
                                        {otherPerson.name.length > 10
                                          ? otherPerson.name.substring(0, 10) +
                                            "..."
                                          : otherPerson.name}{" "}
                                        pays{" "}
                                        {person.name.length > 10
                                          ? person.name.substring(0, 10) + "..."
                                          : person.name}{" "}
                                      </DialogTitle>
                                    </DialogHeader>
                                    <div className="overflow-auto max-h-[400px]">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Total Amount</TableHead>
                                            <TableHead>Share</TableHead>
                                            <TableHead>Date</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {detailedMatrix[otherPerson.name][
                                            person.name
                                          ].expenses.map((exp, i) => (
                                            <TableRow key={i}>
                                              <TableCell>
                                                {exp.description}
                                              </TableCell>
                                              <TableCell>
                                                {currencySymbol}
                                                {exp.totalAmount.toFixed(2)}
                                              </TableCell>
                                              <TableCell>
                                                {currencySymbol}
                                                {exp.amount.toFixed(2)}
                                              </TableCell>
                                              <TableCell>
                                                {new Date(
                                                  exp.date
                                                ).toLocaleDateString()}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </div>
        </Accordion>
      )}

      <Button
        onClick={calculateSummary}
        className="w-full mt-4 bg-expense hover:bg-expense-dark"
      >
        Recalculate
      </Button>
    </Card>
  );
};
