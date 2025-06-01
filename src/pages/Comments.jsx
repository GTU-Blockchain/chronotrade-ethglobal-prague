import { useState } from "react";
import Navbar from "../components/Navbar";

const initialComments = [
  {
    id: 1,
    name: "Ayşe",
    rating: 5,
    text: "Çok iyi bir deneyimdi, teşekkürler!",
  },
  {
    id: 2,
    name: "John",
    rating: 4,
    text: "Zamanında ve ilgiliydi.",
  },
];

const Comments = () => {
  // point to the user rating
  const [userRating, setUserRating] = useState(0);
  // for hover rating
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [showRatingWarning, setShowRatingWarning] = useState(false);

  // Form data states
  const [feedback, setFeedback] = useState("");
  const [confirmTrade, setConfirmTrade] = useState(false);
  const [confirmHonest, setConfirmHonest] = useState(false);

  // Comments state
  const [comments, setComments] = useState(initialComments);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userRating === 0) {
      setShowRatingWarning(true);
      return;
    }
    setShowRatingWarning(false);
    setSubmitted(true);
    // Yeni yorumu ekle
    setComments([
      {
        id: Date.now(),
        name: "You",
        rating: userRating,
        text: feedback,
      },
      ...comments,
    ]);
  };

  return (
    <>
      <Navbar />
      <div className="pt-14 min-h-screen w-full dark:bg-[var(--color-background-dark)] bg-white flex items-center justify-center">
        <div className="p-10 max-w-5xl w-full mx-auto dark:text-white bg-white dark:bg-[var(--color-background-dark)]">
          {/* Service Section */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-24 h-24 rounded-lg overflow-hidden">
              <img
                src="https://picsum.photos/40?random=4"
                alt="Service"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            <div>
              <div className="font-bold text-lg">Acupuncture with Dr. Emily</div>
              <div className="text-gray-400 text-sm">
                60 minutes | 10/12/2022
              </div>
            </div>
          </div>

          {/* Feedback Form */}
          <form className="mt-15" onSubmit={handleSubmit}>
            <div className="font-bold text-xl mb-2">
              Leave feedback for Mehmet
            </div>
            <div className="text-gray-400 text-md mb-3">
              Rate your experience with Mehmet
            </div>

            <div className="flex items-center gap-2 text-2xl font-bold mb-2">
              {/* Star Rating */}
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none"
                  onClick={() => !submitted && setUserRating(star)}
                  onMouseEnter={() => !submitted && setHoverRating(star)}
                  onMouseLeave={() => !submitted && setHoverRating(0)}
                  disabled={submitted}
                >
                  <span
                    className={
                      (hoverRating || userRating) >= star
                        ? "text-[var(--color-primary)]"
                        : "text-gray-400"
                    }
                  >
                    ★
                  </span>
                </button>
              ))}
              <span className="text-3xl font-normal dark:text-white ml-5">
                {userRating > 0 ? userRating.toFixed(1) : ""}
              </span>
            </div>

            {/* Feedback Textarea */}
            <div className="mt-10">
              <label className="font-bold text-xl mb-3 block">Feedback*</label>
              <textarea
                placeholder="Write your feedback here..."
                className="w-full min-h-25 bg-[var(--color-hover)] dark:bg-[var(--color-primary)] border-none rounded-xl dark:text-white p-4 text-sm mb-2 resize-y focus:outline-none"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={submitted}
                required
              />
            </div>

            {/* Checkboxes */}
            <div className="mt-2 space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="accent-[var(--color-primary)] w-4 h-4"
                  checked={confirmTrade}
                  onChange={(e) => setConfirmTrade(e.target.checked)}
                  disabled={submitted}
                  required
                />
                <span className="text-md">
                  I confirm that I have completed a trade with this user
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="accent-[var(--color-primary)] w-4 h-4"
                  checked={confirmHonest}
                  onChange={(e) => setConfirmHonest(e.target.checked)}
                  disabled={submitted}
                  required
                />
                <span className="text-sm">
                  I confirm that this feedback is fair and honest
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`mt-6 px-8 py-3 rounded-xl font-bold text-white bg-[var(--color-primary)] hover:cursor-pointer transition ${
                submitted
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-[var(--color-secondary)] hover:shadow-lg  duration-400"
              }`}
              disabled={submitted}
            >
              {submitted ? "Feedback Submitted" : "Submit"}
            </button>

            {!submitted && showRatingWarning && (
              <div className="text-red-500 mt-3 text-sm font-semibold">
                Please select a star rating.
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
};

export default Comments;