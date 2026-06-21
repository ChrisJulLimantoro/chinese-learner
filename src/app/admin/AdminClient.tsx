"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AdminUser } from "@/app/actions/admin";
import {
  setUserLimitsAction,
  setUserUnlimitedAction,
  setUserRoleAction,
  deleteUserAction,
} from "@/app/actions/admin";
import { Card, Button, Badge, PageHeader } from "@/components/ui";
import { FREE_MAX_VOCAB_WORDS, FREE_MAX_SESSIONS, SUPER_ADMIN_EMAIL } from "@/lib/config";

interface Props {
  users: AdminUser[];
  isSuperAdmin: boolean;
}

export default function AdminClient({ users, isSuperAdmin }: Props) {
  const router = useRouter();
  const [globalError, setGlobalError] = useState<string | null>(null);

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="User Management"
        actions={
          <Button variant="outline" size="sm" onClick={() => router.refresh()}>
            Refresh
          </Button>
        }
      />

      {globalError && (
        <div className="mb-4 p-3 rounded-xl bg-seal/10 border border-seal/20 text-seal text-sm">
          {globalError}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {users.map((user) => (
          <UserRow
            key={user.user_id}
            user={user}
            isSuperAdmin={isSuperAdmin}
            onError={setGlobalError}
            onRefresh={() => router.refresh()}
          />
        ))}
        {users.length === 0 && (
          <Card variant="paper" padding="lg" className="text-center text-muted">
            No users found.
          </Card>
        )}
      </div>
    </div>
  );
}

function UserRow({
  user,
  isSuperAdmin,
  onError,
  onRefresh,
}: {
  user: AdminUser;
  isSuperAdmin: boolean;
  onError: (msg: string) => void;
  onRefresh: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [maxWords, setMaxWords] = useState<string>(
    user.max_vocab_words !== null ? String(user.max_vocab_words) : ""
  );
  const [maxSessions, setMaxSessions] = useState<string>(
    user.max_sessions !== null ? String(user.max_sessions) : ""
  );
  const [localError, setLocalError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const isSuperAdminRow = user.email === SUPER_ADMIN_EMAIL;
  // Super-admin row can never be modified or deleted; also skip self-targeting
  const canModify = isSuperAdmin && !isSuperAdminRow;

  const handleSaveLimits = () => {
    const words = maxWords.trim() === "" ? null : parseInt(maxWords, 10);
    const sessions = maxSessions.trim() === "" ? null : parseInt(maxSessions, 10);

    if (
      (words !== null && (isNaN(words) || words < 0)) ||
      (sessions !== null && (isNaN(sessions) || sessions < 0))
    ) {
      setLocalError("Limits must be non-negative integers or blank for default.");
      return;
    }

    setLocalError(null);
    setSaved(false);

    startTransition(async () => {
      try {
        await setUserLimitsAction(user.user_id, words, sessions);
        setSaved(true);
        onRefresh();
      } catch (e) {
        onError(String(e instanceof Error ? e.message : e));
      }
    });
  };

  const handleSetUnlimited = () => {
    setLocalError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        await setUserUnlimitedAction(user.user_id);
        setMaxWords("");
        setMaxSessions("");
        setSaved(true);
        onRefresh();
      } catch (e) {
        onError(String(e instanceof Error ? e.message : e));
      }
    });
  };

  const handleToggleRole = () => {
    const newRole = user.role === "admin" ? "user" : "admin";
    startTransition(async () => {
      try {
        await setUserRoleAction(user.user_id, newRole);
        onRefresh();
      } catch (e) {
        onError(String(e instanceof Error ? e.message : e));
      }
    });
  };

  const handleDelete = () => {
    if (!confirm(`Delete user ${user.email ?? user.user_id}? This cannot be undone.`)) return;
    startTransition(async () => {
      try {
        await deleteUserAction(user.user_id);
        onRefresh();
      } catch (e) {
        onError(String(e instanceof Error ? e.message : e));
      }
    });
  };

  return (
    <Card variant="paper" padding="md" className={isPending ? "opacity-60 pointer-events-none" : ""}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">
        {/* User identity */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-medium text-ink truncate">{user.email ?? user.user_id}</span>
            <Badge variant={user.role === "admin" ? "jade" : "muted"}>
              {user.role}
            </Badge>
            {isSuperAdminRow && <Badge variant="seal">super-admin</Badge>}
            <Badge variant="muted">HSK {user.current_hsk_level}</Badge>
          </div>
          <p className="text-xs text-faint">
            {user.word_count} word{user.word_count !== 1 ? "s" : ""} ·{" "}
            {user.session_count} session{user.session_count !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Limits editor */}
        {!isSuperAdminRow && (
          <div className="flex flex-col gap-2 min-w-0 sm:min-w-[280px]">
            {localError && (
              <p className="text-xs text-seal">{localError}</p>
            )}
            {saved && (
              <p className="text-xs text-jade">Saved.</p>
            )}
            <div className="flex gap-2 items-end flex-wrap">
              <label className="flex flex-col gap-1 flex-1 min-w-[100px]">
                <span className="text-xs text-faint">Max words</span>
                <input
                  type="number"
                  min={0}
                  value={maxWords}
                  onChange={(e) => setMaxWords(e.target.value)}
                  placeholder={`Default ${FREE_MAX_VOCAB_WORDS}`}
                  className="px-2.5 py-1.5 rounded-lg border border-border bg-paper text-sm text-ink focus:outline-none focus:ring-2 focus:ring-seal w-full"
                />
              </label>
              <label className="flex flex-col gap-1 flex-1 min-w-[100px]">
                <span className="text-xs text-faint">Max sessions</span>
                <input
                  type="number"
                  min={0}
                  value={maxSessions}
                  onChange={(e) => setMaxSessions(e.target.value)}
                  placeholder={`Default ${FREE_MAX_SESSIONS}`}
                  className="px-2.5 py-1.5 rounded-lg border border-border bg-paper text-sm text-ink focus:outline-none focus:ring-2 focus:ring-seal w-full"
                />
              </label>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="primary" size="sm" onClick={handleSaveLimits} disabled={isPending}>
                Save limits
              </Button>
              <Button variant="outline" size="sm" onClick={handleSetUnlimited} disabled={isPending}>
                Set unlimited
              </Button>
              {/* Super-admin only: role toggle + delete */}
              {canModify && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleRole}
                    disabled={isPending}
                  >
                    {user.role === "admin" ? "Demote" : "Promote"}
                  </Button>
                  <Button
                    variant="seal"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isPending}
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
