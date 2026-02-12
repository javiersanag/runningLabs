"use client";

import { useState } from "react";
import { deleteAccount } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Trash2, AlertTriangle } from "lucide-react";

export function DeleteAccountSection() {
    const [isConfirming, setIsConfirming] = useState(false);
    const [confirmText, setConfirmText] = useState("");

    return (
        <div className="mt-12 border-t border-red-100 pt-8">
            <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                <AlertTriangle size={20} />
                Danger Zone
            </h3>
            <p className="text-sm text-neutral-500 mt-2 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
            </p>

            {!isConfirming ? (
                <Button
                    className="bg-red-500 hover:bg-red-600 text-white"
                    onClick={() => setIsConfirming(true)}
                >
                    <Trash2 size={16} className="mr-2" />
                    Delete Account
                </Button>
            ) : (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-4 max-w-md">
                    <p className="text-sm font-bold text-red-800">
                        Are you sure? Type "DELETE" to confirm.
                    </p>
                    <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        className="w-full p-2 border border-red-200 rounded-lg text-sm bg-white"
                        placeholder="Type DELETE"
                    />
                    <div className="flex gap-2">
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={confirmText !== "DELETE"}
                            onClick={async () => await deleteAccount()}
                        >
                            Confirm Deletion
                        </Button>
                        <Button variant="secondary" onClick={() => setIsConfirming(false)}>
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
