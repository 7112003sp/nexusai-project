import React from "react";
import { assets } from "../assets/assets";
import moment from "moment";

const formatInlineText = (text) => {
  if (!text) return null;
  const parts = [];
  let lastIdx = 0;
  const regex = /(\*\*|__)(.*?)\1|(`)(.*?)\3|(\*|_)(.*?)\5/g;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.substring(lastIdx, match.index));
    }

    if (match[1]) {
      parts.push(
        <strong key={key++} className="font-semibold text-gray-900 dark:text-purple-200">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      parts.push(
        <code key={key++} className="bg-purple-900/30 text-purple-300 px-1.5 py-0.5 rounded font-mono text-xs border border-purple-700/30">
          {match[4]}
        </code>
      );
    } else if (match[5]) {
      parts.push(
        <em key={key++} className="italic">
          {match[6]}
        </em>
      );
    }
    lastIdx = regex.lastIndex;
  }

  if (lastIdx < text.length) {
    parts.push(text.substring(lastIdx));
  }

  return parts.length > 0 ? parts : text;
};

const FormattedMarkdown = ({ content }) => {
  if (!content) return null;

  const lines = content.split("\n");
  const blocks = [];
  let inCodeBlock = false;
  let codeBuffer = [];
  let tableBuffer = [];
  let inTable = false;

  const flushTable = (key) => {
    if (tableBuffer.length === 0) return null;
    const rows = tableBuffer.map((row) =>
      row
        .split("|")
        .map((cell) => cell.trim())
        .filter((cell, idx, arr) => idx > 0 && idx < arr.length - 1)
    );
    tableBuffer = [];
    inTable = false;

    if (rows.length === 0) return null;
    const header = rows[0];
    const dataRows = rows.slice(
      rows[1] && rows[1].every((cell) => /^[-:]+$/.test(cell)) ? 2 : 1
    );

    return (
      <div key={key} className="my-3 overflow-x-auto rounded-lg border border-purple-800/40 shadow-sm">
        <table className="min-w-full divide-y divide-purple-800/40 text-xs text-left">
          <thead className="bg-purple-950/60 text-purple-200">
            <tr>
              {header.map((col, idx) => (
                <th key={idx} className="px-3 py-2 font-semibold border-r border-purple-800/30 last:border-r-0">
                  {formatInlineText(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-900/30 bg-purple-950/20 text-gray-200">
            {dataRows.map((r, rIdx) => (
              <tr key={rIdx} className="hover:bg-purple-900/20 transition-colors">
                {r.map((cell, cIdx) => (
                  <td key={cIdx} className="px-3 py-2 border-r border-purple-800/20 last:border-r-0">
                    {formatInlineText(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        blocks.push(
          <pre key={`code-${i}`} className="bg-slate-900 text-purple-200 p-3 rounded-lg my-2 font-mono text-xs overflow-x-auto border border-purple-900/40">
            <code>{codeBuffer.join("\n")}</code>
          </pre>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        if (inTable) blocks.push(flushTable(`table-${i}`));
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      inTable = true;
      tableBuffer.push(line.trim());
      continue;
    } else if (inTable) {
      blocks.push(flushTable(`table-${i}`));
    }

    if (/^(---|[*]{3,}|_{3,})$/.test(line.trim())) {
      blocks.push(<hr key={`hr-${i}`} className="my-3 border-purple-800/40" />);
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push(
        <h3 key={`h3-${i}`} className="text-base font-semibold text-purple-300 mt-3 mb-1">
          {formatInlineText(line.replace("### ", ""))}
        </h3>
      );
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push(
        <h2 key={`h2-${i}`} className="text-lg font-bold text-indigo-300 mt-4 mb-1.5 pb-1 border-b border-purple-800/30">
          {formatInlineText(line.replace("## ", ""))}
        </h2>
      );
      continue;
    }
    if (line.startsWith("# ")) {
      blocks.push(
        <h1 key={`h1-${i}`} className="text-xl font-extrabold text-indigo-200 mt-4 mb-2">
          {formatInlineText(line.replace("# ", ""))}
        </h1>
      );
      continue;
    }

    const listMatch = line.match(/^(\s*)(-|\*|\d+\.)\s+(.*)/);
    if (listMatch) {
      const isNum = /^\d+\./.test(listMatch[2]);
      blocks.push(
        <div key={`li-${i}`} className="flex items-start gap-2 my-0.5 pl-2 text-sm">
          <span className="text-purple-400 font-semibold select-none">{isNum ? listMatch[2] : "•"}</span>
          <span className="flex-1">{formatInlineText(listMatch[3])}</span>
        </div>
      );
      continue;
    }

    if (line.trim() === "") {
      blocks.push(<div key={`blank-${i}`} className="h-1.5" />);
      continue;
    }

    blocks.push(
      <p key={`p-${i}`} className="text-sm leading-relaxed my-0.5">
        {formatInlineText(line)}
      </p>
    );
  }

  if (inTable) {
    blocks.push(flushTable("table-end"));
  }

  return <div className="space-y-0.5">{blocks}</div>;
};

const Message = ({ message }) => {
  const formattedTime = message.timestamp
    ? moment(Number(message.timestamp) || message.timestamp).format("h:mm A")
    : "";

  return (
    <div>
      {message.role === "user" ? (
        <div className="flex items-start justify-end my-3 sm:my-4 gap-2">
          <div className="flex flex-col gap-1 p-2.5 px-3.5 sm:p-3 sm:px-4 bg-slate-100 dark:bg-[#57317C]/30 border border-gray-200 dark:border-[#80609F]/30 rounded-2xl rounded-tr-none max-w-[85%] sm:max-w-2xl break-words">
            <p className="text-xs sm:text-sm dark:text-white text-gray-800 leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
            {formattedTime && (
              <span className="text-[10px] text-right text-gray-400 dark:text-[#B1A6C0]">
                {formattedTime}
              </span>
            )}
          </div>

          <img
            src={assets.user_icon}
            alt="User"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover shrink-0 mt-0.5"
          />
        </div>
      ) : (
        <div className="flex items-start justify-start my-3 sm:my-4 gap-2">
          <img
            src={assets.logo_full_dark || assets.user_icon}
            alt="AI"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-contain bg-purple-900/40 p-1 border border-purple-500/20 shrink-0 mt-0.5"
          />
          <div className="flex flex-col gap-1 p-2.5 px-3.5 sm:p-3 sm:px-4 max-w-[85%] sm:max-w-2xl bg-primary/10 dark:bg-[#57317C]/30 border border-primary/30 dark:border-[#80609F]/30 rounded-2xl rounded-tl-none break-words overflow-hidden">
            {message.isImage ? (
              <img
                src={message.content}
                alt="Generated AI Content"
                className="w-full max-w-md my-1 rounded-lg"
              />
            ) : (
              <div className="text-xs sm:text-sm dark:text-white text-gray-800 leading-relaxed reset-tw">
                <FormattedMarkdown content={message.content} />
              </div>
            )}

            {formattedTime && (
              <span className="text-[10px] text-left text-gray-400 dark:text-[#B1A6C0]">
                {formattedTime}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;