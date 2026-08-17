import { useState } from 'react';
import PageAmbientBg from './PageAmbientBg';
import PlayReviewPromptModal from './PlayReviewPromptModal';
import {
  markPlayReviewPageOpened,
  openQuestDpPlayStore,
} from '../playReviewPrompt';

export default function PlayReviewPromptPreview() {
  const [open, setOpen] = useState(true);

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#010828]">
      <PageAmbientBg blur />
      {open ? (
        <PlayReviewPromptModal
          subject="adsp"
          totalAttempts={30}
          onReview={() => {
            markPlayReviewPageOpened();
            openQuestDpPlayStore();
          }}
          onClose={() => setOpen(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="kr-heading fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl px-5 py-3 text-[13px] text-cream"
          style={{
            background: 'rgba(103,232,249,0.10)',
            border: '1px solid rgba(103,232,249,0.24)',
          }}
        >
          리뷰 요청 다시 보기
        </button>
      )}
    </section>
  );
}
