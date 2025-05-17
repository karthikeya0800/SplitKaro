import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AppDispatch, RootState, CurrencyType } from "@/redux/store";
import { useTheme } from "@/context/ThemeContext";
import {
  LogOut,
  Sun,
  Moon,
  Settings,
  Pencil,
  Trash2,
  UserPlus,
  RefreshCcw,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useDispatch, useSelector } from "react-redux";
import { logout, updateUser, deleteUser } from "@/redux/slices/authSlice";
import {
  createParticipant,
  readParticipants,
  updateParticipant,
  deleteParticipant,
} from "@/redux/slices/participantSlice";
import { IUser } from "@/types";
import { readExpenses } from "@/redux/slices/expenseSlice";

export const Header: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, userLoading } = useSelector((state: RootState) => state.auth);
  const { participants, participantLoading } = useSelector(
    (state: RootState) => state.participants
  );
  const { theme, toggleTheme } = useTheme();
  const [currencyDialogOpen, setCurrencyDialogOpen] = useState(false);
  const [addOrEditDialogOpen, setAddOrEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState("");

  const [newParticipant, setNewParticipant] = useState("");
  const [editingParticipant, setEditingParticipant] = useState<{
    name: string;
    index: number;
    id: string;
  } | null>(null);

  const syncData = async () => {
    try {
      await dispatch(readParticipants()).unwrap();
      await dispatch(readExpenses()).unwrap();
      toast.success(`Data synced successfully`);
    } catch (err) {
      if (err.includes("Session Expired")) {
        dispatch(logout());
        toast.error(err);
      }
      console.error(err);
    }
  };

  const handleAddParticipant = async () => {
    try {
      const response = await dispatch(
        createParticipant({ name: newParticipant })
      ).unwrap();
      setNewParticipant("");
      toast.success(`${response.name} added successfully`);
    } catch (err) {
      if (err.includes("Session Expired")) {
        dispatch(logout());
        toast.error(err);
      }
      toast.error(err);
      console.error(err);
    }
  };

  const handleEditParticipant = async () => {
    try {
      const response = await dispatch(
        updateParticipant({ id: editingParticipant.id, name: newParticipant })
      ).unwrap();
      setNewParticipant("");
      setEditingParticipant(null);
      toast.success(`${response.name} updated successfully`);
    } catch (err) {
      if (err.includes("Session Expired")) {
        dispatch(logout());
        toast.error(err);
      }
      console.error(err);
    }
  };

  const handleDeleteParticipant = async (id: string) => {
    try {
      const response = await dispatch(deleteParticipant(id)).unwrap();
      dispatch(readExpenses()).unwrap();
      setNewParticipant("");
      setIdToDelete("");
      setDeleteDialogOpen(false);
      toast.success("Participant Deleted");
    } catch (err) {
      if (err.includes("Session Expired")) {
        dispatch(logout());
        toast.error(err);
      }
      console.error(err);
    }
  };

  const startEditParticipant = (name: string, id: string, index: number) => {
    setNewParticipant(name);
    setEditingParticipant({ name, index, id });
  };

  const handleUpdateUser = async (data: Partial<IUser>) => {
    try {
      const response = await dispatch(
        updateUser({ id: user._id, data })
      ).unwrap();
      toast.success(`Currency Updated to ${response.currency}`);
      setCurrencyDialogOpen(false);
    } catch (err) {
      if (err.includes("Session Expired")) {
        dispatch(logout());
        toast.error(err);
      }
      console.error(err);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await dispatch(deleteUser({ id: user._id })).unwrap();
      toast.success("It was good while it lasted, Good Bye mate!");
      setDeleteAccountDialogOpen(false);
      dispatch(logout());
    } catch (err) {
      if (err.includes("Session Expired")) {
        dispatch(logout());
        toast.error(err);
      }
      console.error(err);
    }
  };

  return (
    <header className="flex justify-between items-center py-4 px-4 md:px-0">
      <h1 className="text-2xl font-bold">Split Karo</h1>

      <div className="flex items-center gap-3">
        <div className="text-sm text-muted-foreground">{user?.email}</div>

        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full w-9 h-9 border-none"
        >
          {theme === "dark" ? <Sun /> : <Moon />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-9 h-9"
            >
              <Settings />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="space-y-1">
            <DropdownMenuLabel>Account Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setCurrencyDialogOpen(true)}>
              Change Currency
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setAddOrEditDialogOpen(true)}>
              Add/Edit Participants
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                setDeleteAccountDialogOpen(true);
              }}
              className="text-destructive"
            >
              Delete Account
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={syncData}>
              <RefreshCcw className="mr-2" size={20} /> Sync Data
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                const temp = user.email;
                dispatch(logout());
                toast.success(`${temp} logged out successfully`);
              }}
            >
              <LogOut className="mr-2" size={20} /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={currencyDialogOpen} onOpenChange={setCurrencyDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Change Currency</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Select
                defaultValue={user?.currency}
                onValueChange={(value) =>
                  handleUpdateUser({ currency: value as CurrencyType })
                }
              >
                {userLoading ? (
                  <Loader2 className="animate-spin mx-auto" />
                ) : (
                  <>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                    </SelectContent>
                  </>
                )}
              </Select>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={addOrEditDialogOpen}
          onOpenChange={() => {
            setEditingParticipant(null);
            !participantLoading && setNewParticipant("");
            setAddOrEditDialogOpen(false);
          }}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add or Edit Participants</DialogTitle>
            </DialogHeader>
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
                    editingParticipant
                      ? handleEditParticipant()
                      : handleAddParticipant();
                  }
                }}
              />
              <Button
                onClick={() =>
                  editingParticipant
                    ? handleEditParticipant()
                    : handleAddParticipant()
                }
                disabled={!newParticipant || participantLoading}
                className="bg-expense hover:bg-expense-dark whitespace-nowrap w-20"
              >
                {participantLoading ? (
                  <Loader2 className="animate-spin" />
                ) : editingParticipant ? (
                  "Update"
                ) : (
                  <>
                    <UserPlus size={18} className="mr-2" /> Add
                  </>
                )}
              </Button>
            </div>
            <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
              {participants?.map((val, index) => (
                <div
                  key={val.name}
                  className="flex justify-between items-center p-2 bg-secondary rounded-md"
                >
                  <span className="overflow-scroll">{val.name}</span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        startEditParticipant(val.name, val._id, index)
                      }
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => {
                        setIdToDelete(val._id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Are you sure you want to delete?</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>
                All expenses of this user are considered as settled and the
                final summary will be updated accordingly.
              </p>
            </div>
            <div className="mt-4">
              <Button
                type="button"
                onClick={() => handleDeleteParticipant(idToDelete)}
                className="bg-destructive w-40"
                disabled={participantLoading}
              >
                {participantLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Proceed with Deletion"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={deleteAccountDialogOpen}
          onOpenChange={setDeleteAccountDialogOpen}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                Are you sure you want to permanently delete your account?
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>
                This action is irreversible and will result in the loss of all
                expense data. Please proceed only after the settlement.
              </p>
            </div>
            <div className="mt-4">
              <Button
                type="button"
                onClick={() => handleDeleteAccount()}
                className="bg-destructive w-40"
                disabled={userLoading}
              >
                {userLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Proceed with Deletion"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
};
