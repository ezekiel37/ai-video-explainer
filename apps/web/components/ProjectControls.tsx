"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useSession, signIn, signUp, signOut } from "@/lib/auth-client";
import { useEditorStore } from "@/lib/store";

const control = "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm";
export function ProjectControls() {
  const { data: session, isPending } = useSession();
  const state = useEditorStore();
  const [register, setRegister] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string>();
  const userId = session?.user.id ?? null;
  const { setSessionUser } = state;
  useEffect(() => { if (!isPending) void setSessionUser(userId); }, [userId, isPending, setSessionUser]);
  useEffect(() => {
    const protect = (event: BeforeUnloadEvent) => {
      if (state.dirty || state.sourceDirty) { event.preventDefault(); event.returnValue = ""; }
    };
    window.addEventListener("beforeunload", protect);
    return () => window.removeEventListener("beforeunload", protect);
  }, [state.dirty, state.sourceDirty]);
  async function authenticate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      const invalid = form.querySelector<HTMLInputElement>(":invalid");
      setAuthError(invalid?.validationMessage ?? "Complete the required fields.");
      invalid?.focus();
      return;
    }
    const fields = new FormData(form);
    setAuthBusy(true); setAuthError(undefined);
    try {
      const credentials = { email: String(fields.get("email")), password: String(fields.get("password")) };
      const result = register
        ? await signUp.email({ ...credentials, name: String(fields.get("name")) })
        : await signIn.email(credentials);
      if (result.error) setAuthError(result.error.message ?? "Could not sign in. Please try again.");
      else form.reset();
    } catch { setAuthError("Could not reach the sign-in service. Please try again."); }
    finally { setAuthBusy(false); }
  }
  return <section aria-label="Account and projects" className="mx-auto mb-4 grid max-w-[1500px] gap-3 rounded-lg border border-zinc-200 bg-white p-4">
    {isPending ? <p role="status">Checking your session…</p> : session ? <div className="flex flex-wrap items-center gap-3">
      <p className="mr-auto break-all text-sm">Signed in as {session.user.email}</p>
      <button className={control} disabled={state.busy || authBusy || state.dirty || state.sourceDirty} onClick={async () => {
        setAuthBusy(true);
        try { const result = await signOut(); if (result.error) setAuthError(result.error.message); }
        catch { setAuthError("Could not sign out. Please retry."); }
        finally { setAuthBusy(false); }
      }}>Sign out</button>
    </div> : <details>
      <summary className="cursor-pointer text-sm font-medium">Sign in to save and render · Preview works without an account</summary>
      <form noValidate onSubmit={authenticate} className="mt-3 flex flex-wrap items-end gap-3">
        {register && <label className="grid gap-1 text-sm">Name<input aria-describedby={authError ? "auth-error" : undefined} className={control} name="name" autoComplete="name" required maxLength={120} disabled={authBusy} /></label>}
        <label className="grid gap-1 text-sm">Email<input aria-describedby={authError ? "auth-error" : undefined} className={control} name="email" type="email" autoComplete="email" required disabled={authBusy} /></label>
        <label className="grid gap-1 text-sm">Password<input aria-describedby={authError ? "auth-error" : undefined} className={control} name="password" type="password" autoComplete={register ? "new-password" : "current-password"} minLength={8} maxLength={128} required disabled={authBusy} /></label>
        <button type="submit" className={control} disabled={authBusy}>{authBusy ? "Please wait…" : register ? "Create account" : "Sign in"}</button>
        <button type="button" className={control} disabled={authBusy} onClick={() => { setRegister(!register); setAuthError(undefined); }}>{register ? "Use existing account" : "Create an account"}</button>
      </form>
    </details>}
    {authError && <p id="auth-error" role="alert" className="text-sm text-red-700">{authError}</p>}
    <div className="flex flex-wrap items-center gap-3">
      {state.userId && <label className="flex items-center gap-2 text-sm">Projects
        <select aria-label="Open saved project" className={control} value={state.projectId ?? ""} disabled={state.busy || state.dirty || state.sourceDirty} onChange={event => { if (event.target.value) void state.openProject(event.target.value); }}>
          <option value="">Choose a saved project</option>
          {state.projects.map(project => <option key={project.id} value={project.id}>{project.title}</option>)}
        </select>
      </label>}
      {state.projectId && <button className={control} disabled={state.busy || state.dirty || state.sourceDirty} onClick={() => void state.openProject(state.projectId!)}>Reload saved</button>}
      <button className={control} disabled={state.busy || state.dirty || state.sourceDirty} onClick={state.newProject}>New project</button>
      <button className={control} disabled={state.busy || !state.userId || state.sourceDirty || !state.dirty && !!state.projectId} onClick={() => void state.save()}>{state.busy ? "Working…" : "Save changes"}</button>
      <button className={control} disabled={state.busy || !state.dirty && !state.sourceDirty} onClick={state.discard}>Discard edits</button>
      <p className="text-sm text-zinc-600" role="status">{state.sourceDirty ? "Source changed — apply Generate scenes or Import" : state.dirty ? "Unsaved edits" : state.projectId ? "Saved project" : "Unsaved demo"}</p>
    </div>
    {state.error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
    {state.pollError && <p role="alert" className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">{state.pollError}</p>}
    {state.notice && <p role="status" className="text-sm text-accent">{state.notice}</p>}
  </section>;
}
