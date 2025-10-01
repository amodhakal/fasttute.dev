import toast from "react-hot-toast";

export function errorToast(error: string) {
  toast(error, { style: { backgroundColor: "red", color: "white" } });
}
