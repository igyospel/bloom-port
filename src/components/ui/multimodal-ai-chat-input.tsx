'use client';

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
  memo,
} from 'react';
import equal from 'fast-deep-equal';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 as LoaderIcon, X as XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Attachment {
  url: string;
  name: string;
  contentType: string;
  size: number;
}

export interface UIMessage {
  id: string;
  content: string;
  role: string;
  attachments?: Attachment[];
}

export type VisibilityType = 'public' | 'private' | 'unlisted' | string;

// ── Icons ─────────────────────────────────────────────────────────────────────
const StopIcon = ({ size = 16 }: { size?: number }) => (
  <svg height={size} viewBox="0 0 16 16" width={size} style={{ color: 'currentcolor' }}>
    <path fillRule="evenodd" clipRule="evenodd" d="M3 3H13V13H3V3Z" fill="currentColor" />
  </svg>
);

const PaperclipIcon = ({ size = 16 }: { size?: number }) => (
  <svg height={size} strokeLinejoin="round" viewBox="0 0 16 16" width={size}
    style={{ color: 'currentcolor' }} className="-rotate-45">
    <path fillRule="evenodd" clipRule="evenodd"
      d="M10.8591 1.70735C10.3257 1.70735 9.81417 1.91925 9.437 2.29643L3.19455 8.53886C2.56246 9.17095 2.20735 10.0282 2.20735 10.9222C2.20735 11.8161 2.56246 12.6734 3.19455 13.3055C3.82665 13.9376 4.68395 14.2927 5.57786 14.2927C6.47178 14.2927 7.32908 13.9376 7.96117 13.3055L14.2036 7.06304L14.7038 6.56287L15.7041 7.56321L15.204 8.06337L8.96151 14.3058C8.06411 15.2032 6.84698 15.7074 5.57786 15.7074C4.30875 15.7074 3.09162 15.2032 2.19422 14.3058C1.29682 13.4084 0.792664 12.1913 0.792664 10.9222C0.792664 9.65305 1.29682 8.43592 2.19422 7.53852L8.43666 1.29609C9.07914 0.653606 9.95054 0.292664 10.8591 0.292664C11.7678 0.292664 12.6392 0.653606 13.2816 1.29609C13.9241 1.93857 14.2851 2.80997 14.2851 3.71857C14.2851 4.62718 13.9241 5.49858 13.2816 6.14106L13.2814 6.14133L7.0324 12.3835C7.03231 12.3836 7.03222 12.3837 7.03213 12.3838C6.64459 12.7712 6.11905 12.9888 5.57107 12.9888C5.02297 12.9888 4.49731 12.7711 4.10974 12.3835C3.72217 11.9959 3.50444 11.4703 3.50444 10.9222C3.50444 10.3741 3.72217 9.8484 4.10974 9.46084L4.11004 9.46054L9.877 3.70039L10.3775 3.20051L11.3772 4.20144L10.8767 4.70131L5.11008 10.4612C5.11005 10.4612 5.11003 10.4612 5.11 10.4613C4.98779 10.5835 4.91913 10.7493 4.91913 10.9222C4.91913 11.0951 4.98782 11.2609 5.11008 11.3832C5.23234 11.5054 5.39817 11.5741 5.57107 11.5741C5.74398 11.5741 5.9098 11.5054 6.03206 11.3832L6.03233 11.3829L12.2813 5.14072C12.2814 5.14063 12.2815 5.14054 12.2816 5.14045C12.6586 4.7633 12.8704 4.25185 12.8704 3.71857C12.8704 3.18516 12.6585 2.6736 12.2813 2.29643C11.9041 1.91925 11.3926 1.70735 10.8591 1.70735Z"
      fill="currentColor" />
  </svg>
);

const ArrowUpIcon = ({ size = 16 }: { size?: number }) => (
  <svg height={size} strokeLinejoin="round" viewBox="0 0 16 16" width={size}
    style={{ color: 'currentcolor' }}>
    <path fillRule="evenodd" clipRule="evenodd"
      d="M8.70711 1.39644C8.31659 1.00592 7.68342 1.00592 7.2929 1.39644L2.21968 6.46966L1.68935 6.99999L2.75001 8.06065L3.28034 7.53032L7.25001 3.56065V14.25V15H8.75001V14.25V3.56065L12.7197 7.53032L13.25 8.06065L14.3107 6.99999L13.7803 6.46966L8.70711 1.39644Z"
      fill="currentColor" />
  </svg>
);

// ── Suggested Actions ─────────────────────────────────────────────────────────
interface SuggestedActionsProps {
  chatId: string;
  onSelectAction: (action: string) => void;
  selectedVisibilityType: VisibilityType;
}

function PureSuggestedActions({ onSelectAction }: SuggestedActionsProps) {
  const suggestedActions = [
    { title: 'How can I improve', label: 'my time management skills?', action: 'How can I improve my time management skills?' },
    { title: 'Suggest ideas for', label: 'a creative writing project', action: 'Suggest ideas for a creative writing project' },
    { title: 'What are some tips', label: 'for staying motivated?', action: 'What are some tips for staying motivated?' },
    { title: 'Help me brainstorm', label: 'ideas for a new hobby', action: 'Help me brainstorm ideas for a new hobby' },
  ];

  return (
    <div data-testid="suggested-actions" className="grid pb-2 sm:grid-cols-2 gap-2 w-full">
      <AnimatePresence>
        {suggestedActions.map((sa, index) => (
          <motion.div
            key={`suggested-action-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.05 * index }}
            className={index > 1 ? 'hidden sm:block' : 'block'}
          >
            <button
              type="button"
              onClick={() => onSelectAction(sa.action)}
              className="text-left border rounded-xl px-4 py-3.5 text-sm flex flex-col gap-1 w-full h-auto border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            >
              <span className="font-medium text-white">{sa.title}</span>
              <span className="text-white/50">{sa.label}</span>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

const SuggestedActions = memo(
  PureSuggestedActions,
  (prev, next) =>
    prev.chatId === next.chatId &&
    prev.selectedVisibilityType === next.selectedVisibilityType,
);

// ── Preview Attachment ────────────────────────────────────────────────────────
const PreviewAttachment = ({
  attachment,
  isUploading = false,
}: {
  attachment: Attachment;
  isUploading?: boolean;
}) => {
  const { name, url, contentType } = attachment;
  return (
    <div data-testid="input-attachment-preview" className="flex flex-col gap-1">
      <div className="w-20 h-16 aspect-video bg-white/10 rounded-md relative flex flex-col items-center justify-center overflow-hidden border border-white/10">
        {contentType?.startsWith('image/') && url ? (
          <img key={url} src={url} alt={name ?? 'attachment'} className="rounded-md size-full object-cover" />
        ) : (
          <div className="flex items-center justify-center text-xs text-white/50 text-center p-1">
            {name?.split('.').pop()?.toUpperCase() || 'FILE'}
          </div>
        )}
        {isUploading && (
          <div data-testid="input-attachment-loader" className="animate-spin absolute text-white/60">
            <LoaderIcon className="size-5" />
          </div>
        )}
      </div>
      <div className="text-xs text-white/50 max-w-20 truncate">{name}</div>
    </div>
  );
};

// ── Attachments Button ────────────────────────────────────────────────────────
function PureAttachmentsButton({
  fileInputRef,
  disabled,
}: {
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  disabled: boolean;
}) {
  return (
    <button
      data-testid="attachments-button"
      type="button"
      className="rounded-md rounded-bl-lg p-[7px] h-fit border border-white/10 hover:bg-white/10 text-white/50 hover:text-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      onClick={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}
      disabled={disabled}
      aria-label="Attach files"
    >
      <PaperclipIcon size={14} />
    </button>
  );
}

const AttachmentsButton = memo(PureAttachmentsButton, (prev, next) => prev.disabled === next.disabled);

// ── Stop Button ───────────────────────────────────────────────────────────────
function PureStopButton({ onStop }: { onStop: () => void }) {
  return (
    <button
      data-testid="stop-button"
      type="button"
      className="rounded-full p-1.5 h-fit border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors"
      onClick={(e) => { e.preventDefault(); onStop(); }}
      aria-label="Stop generating"
    >
      <StopIcon size={14} />
    </button>
  );
}

const StopButton = memo(PureStopButton, (prev, next) => prev.onStop === next.onStop);

// ── Send Button ───────────────────────────────────────────────────────────────
function PureSendButton({
  submitForm,
  input,
  uploadQueue,
  attachments,
  canSend,
  isGenerating,
}: {
  submitForm: () => void;
  input: string;
  uploadQueue: string[];
  attachments: Attachment[];
  canSend: boolean;
  isGenerating: boolean;
}) {
  const isDisabled =
    uploadQueue.length > 0 ||
    !canSend ||
    isGenerating ||
    (input.trim().length === 0 && attachments.length === 0);

  return (
    <button
      data-testid="send-button"
      type="button"
      className={cn(
        'rounded-full p-1.5 h-fit border transition-colors flex items-center justify-center',
        isDisabled
          ? 'border-white/10 text-white/20 cursor-not-allowed'
          : 'bg-white border-white text-black hover:bg-neutral-200',
      )}
      onClick={(e) => { e.preventDefault(); if (!isDisabled) submitForm(); }}
      disabled={isDisabled}
      aria-label="Send message"
    >
      <ArrowUpIcon size={14} />
    </button>
  );
}

const SendButton = memo(PureSendButton, (prev, next) => {
  if (prev.input !== next.input) return false;
  if (prev.uploadQueue.length !== next.uploadQueue.length) return false;
  if (prev.attachments.length !== next.attachments.length) return false;
  if (prev.attachments.length > 0 && !equal(prev.attachments, next.attachments)) return false;
  if (prev.canSend !== next.canSend) return false;
  if (prev.isGenerating !== next.isGenerating) return false;
  return true;
});

// ── Main Component ────────────────────────────────────────────────────────────
export interface MultimodalInputProps {
  chatId: string;
  messages: UIMessage[];
  attachments: Attachment[];
  setAttachments: Dispatch<SetStateAction<Attachment[]>>;
  onSendMessage: (params: { input: string; attachments: Attachment[] }) => void;
  onStopGenerating: () => void;
  isGenerating: boolean;
  canSend: boolean;
  className?: string;
  selectedVisibilityType: VisibilityType;
}

function PureMultimodalInput({
  chatId,
  messages,
  attachments,
  setAttachments,
  onSendMessage,
  onStopGenerating,
  isGenerating,
  canSend,
  className,
  selectedVisibilityType,
}: MultimodalInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState('');
  const [uploadQueue, setUploadQueue] = useState<string[]>([]);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (el) { el.style.height = 'auto'; el.style.height = `${el.scrollHeight + 2}px`; }
  };

  const resetHeight = useCallback(() => {
    const el = textareaRef.current;
    if (el) { el.style.height = 'auto'; el.rows = 1; adjustHeight(); }
  }, []);

  useEffect(() => { adjustHeight(); }, [input]);

  const uploadFile = async (file: File): Promise<Attachment | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const mockUrl = URL.createObjectURL(file);
          resolve({ url: mockUrl, name: file.name, contentType: file.type || 'application/octet-stream', size: file.size });
        } catch {
          resolve(undefined);
        } finally {
          setUploadQueue((q) => q.filter((n) => n !== file.name));
        }
      }, 700);
    });
  };

  const handleFileChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setUploadQueue((q) => [...q, ...files.map((f) => f.name)]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    const MAX = 25 * 1024 * 1024;
    const valid = files.filter((f) => f.size <= MAX);
    const invalid = files.filter((f) => f.size > MAX);
    if (invalid.length) setUploadQueue((q) => q.filter((n) => !invalid.some((f) => f.name === n)));
    const results = await Promise.all(valid.map(uploadFile));
    setAttachments((cur) => [...cur, ...results.filter((a): a is Attachment => !!a)]);
  }, [setAttachments]);

  const handleRemoveAttachment = useCallback((att: Attachment) => {
    if (att.url.startsWith('blob:')) URL.revokeObjectURL(att.url);
    setAttachments((cur) => cur.filter((a) => a.url !== att.url || a.name !== att.name));
    textareaRef.current?.focus();
  }, [setAttachments]);

  const submitForm = useCallback(() => {
    if (!input.trim() && !attachments.length) return;
    onSendMessage({ input, attachments });
    setInput('');
    setAttachments([]);
    attachments.forEach((a) => { if (a.url.startsWith('blob:')) URL.revokeObjectURL(a.url); });
    resetHeight();
    textareaRef.current?.focus();
  }, [input, attachments, onSendMessage, setAttachments, resetHeight]);

  const showSuggested = messages.length === 0 && !attachments.length && !uploadQueue.length;
  const attachDisabled = isGenerating || uploadQueue.length > 0;

  return (
    <div className={cn('relative w-full flex flex-col gap-4', className)}>
      {/* Suggested actions */}
      <AnimatePresence>
        {showSuggested && (
          <motion.div
            key="suggested-actions-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <SuggestedActions
              onSelectAction={(action) => {
                setInput(action);
                requestAnimationFrame(() => { adjustHeight(); textareaRef.current?.focus(); });
              }}
              chatId={chatId}
              selectedVisibilityType={selectedVisibilityType}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input */}
      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
        disabled={attachDisabled}
        accept="image/*,video/*,audio/*,.pdf"
      />

      {/* Attachment previews */}
      {(attachments.length > 0 || uploadQueue.length > 0) && (
        <div
          data-testid="attachments-preview"
          className="flex pt-[10px] flex-row gap-3 overflow-x-auto items-end pb-2 pl-1"
        >
          {attachments.map((att) => (
            <div key={att.url || att.name} className="relative group">
              <PreviewAttachment attachment={att} isUploading={false} />
              <button
                type="button"
                className="absolute top-[-8px] right-[-8px] h-5 w-5 rounded-full p-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 border border-white/20 text-white hover:bg-white/20"
                onClick={() => handleRemoveAttachment(att)}
                aria-label={`Remove ${att.name}`}
              >
                <XIcon className="size-3" />
              </button>
            </div>
          ))}
          {uploadQueue.map((filename, i) => (
            <PreviewAttachment
              key={`upload-${filename}-${i}`}
              attachment={{ url: '', name: filename, contentType: '', size: 0 }}
              isUploading
            />
          ))}
        </div>
      )}

      {/* Textarea */}
      <textarea
        data-testid="multimodal-input"
        ref={textareaRef}
        placeholder="Send a message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className={cn(
          'min-h-[24px] max-h-[calc(75dvh)] overflow-y-auto resize-none rounded-2xl text-base pb-10 px-4 pt-3',
          'bg-white/5 border border-white/10 text-white placeholder:text-white/30',
          'focus:outline-none focus-visible:ring-1 focus-visible:ring-white/20',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          className,
        )}
        rows={1}
        autoFocus
        disabled={!canSend || isGenerating || uploadQueue.length > 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            if (canSend && !isGenerating && !uploadQueue.length && (input.trim() || attachments.length)) {
              submitForm();
            }
          }
        }}
      />

      {/* Bottom-left: attach */}
      <div className="absolute bottom-0 left-0 p-2 w-fit flex flex-row justify-start z-10">
        <AttachmentsButton fileInputRef={fileInputRef} disabled={attachDisabled} />
      </div>

      {/* Bottom-right: stop / send */}
      <div className="absolute bottom-0 right-0 p-2 w-fit flex flex-row justify-end z-10">
        {isGenerating ? (
          <StopButton onStop={onStopGenerating} />
        ) : (
          <SendButton
            submitForm={submitForm}
            input={input}
            uploadQueue={uploadQueue}
            attachments={attachments}
            canSend={canSend}
            isGenerating={isGenerating}
          />
        )}
      </div>
    </div>
  );
}

export { PureMultimodalInput };
