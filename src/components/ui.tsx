import Link from "next/link";
import React from "react";

export function Card(props: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 ${props.className ?? ""}`}>
      {props.title ? (
        <div className="border-b border-zinc-100 px-4 py-3">
          <h2 className="text-sm font-semibold">{props.title}</h2>
        </div>
      ) : null}
      <div className="p-4">{props.children}</div>
    </div>
  );
}

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }
) {
  const variant = props.variant ?? "primary";
  const base =
    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-50";
  const style =
    variant === "primary"
      ? "bg-zinc-900 text-white hover:bg-zinc-800"
      : "bg-transparent text-zinc-900 hover:bg-zinc-100";
  return (
    <button {...props} className={`${base} ${style} ${props.className ?? ""}`}>
      {props.children}
    </button>
  );
}

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input(props, ref) {
  return (
    <input
      ref={ref}
      {...props}
      className={`w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-300 ${props.className ?? ""}`}
    />
  );
});

export const TextArea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function TextArea(props, ref) {
  return (
    <textarea
      ref={ref}
      {...props}
      className={`w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-300 ${props.className ?? ""}`}
    />
  );
});

export function Badge(props: {
  children: React.ReactNode;
  tone?: "neutral" | "green" | "yellow" | "red";
}) {
  const tone = props.tone ?? "neutral";
  const cls =
    tone === "green"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : tone === "yellow"
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : tone === "red"
          ? "bg-rose-50 text-rose-700 ring-rose-200"
          : "bg-zinc-50 text-zinc-700 ring-zinc-200";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ring-1 ${cls}`}>
      {props.children}
    </span>
  );
}

export function NavLink(props: { href: string; children: React.ReactNode }) {
  return (
    <Link className="rounded-xl px-3 py-2 text-sm hover:bg-zinc-100 no-underline" href={props.href}>
      {props.children}
    </Link>
  );
}
