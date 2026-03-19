"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './quiz.module.css';
import { submitQuizAttemptAction } from '@/app/actions/quiz';

export default function QuizClient({ quiz, questions }: { quiz: any; questions: any[] }) {
  const router = useRouter();
  
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(quiz.time_limit_seconds);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = useCallback(async () => {
    setIsSubmitted(true);
    const timeTaken = quiz.time_limit_seconds - timeLeft;
    
    // Call server action
    const res = await submitQuizAttemptAction(quiz.id, selectedOptions, timeTaken);
    if (res?.error) {
      alert("Error submitting quiz: " + res.error);
      setIsSubmitted(false);
      return;
    }
    
    router.push('/leaderboard');
  }, [quiz.id, quiz.time_limit_seconds, timeLeft, selectedOptions, router]);

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleSubmit();
      return;
    }
    if (isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted, handleSubmit]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const question = questions[currentQuestionIdx];
  const progressPercent = ((currentQuestionIdx + 1) / questions.length) * 100;

  const handleOptionSelect = (optionIdx: number) => {
    setSelectedOptions(prev => ({ ...prev, [question.id]: optionIdx }));
  };

  if (isSubmitted) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.submittingTitle}>Submitting your quiz...</h2>
          <p className={styles.submittingText}>Calculating your score and updating the leaderboard.</p>
          <div className={styles.loader}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.quizWrapper}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.quizTitle}>{quiz.title}</h1>
            <p className={styles.questionCounter}>
              Question {currentQuestionIdx + 1} of {questions.length}
            </p>
          </div>
          <div className={`${styles.timer} ${timeLeft < 300 ? styles.timerWarning : ''}`}>
            {formatTime(timeLeft)}
          </div>
        </header>

        <div className={styles.progressContainer}>
          <div className={styles.progressBar} style={{ width: `${progressPercent}%` }}></div>
        </div>

        <main className={styles.questionArea}>
          <h2 className={styles.questionText}>
            <span className={styles.questionNum}>{currentQuestionIdx + 1}. </span>
            {question.text}
          </h2>

          <div className={styles.optionsList}>
            {question.options.map((option: string, idx: number) => (
              <label 
                key={idx} 
                className={`${styles.optionLabel} ${selectedOptions[question.id] === idx ? styles.optionSelected : ''}`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  className={styles.radioInput}
                  checked={selectedOptions[question.id] === idx}
                  onChange={() => handleOptionSelect(idx)}
                />
                <span className={styles.optionText}>{option}</span>
              </label>
            ))}
          </div>
        </main>

        <footer className={styles.footer}>
          <button 
            className={styles.secondaryBtn} 
            onClick={() => setCurrentQuestionIdx(prev => prev - 1)} 
            disabled={currentQuestionIdx === 0}
          >
            Previous
          </button>
          
          {currentQuestionIdx === questions.length - 1 ? (
            <button className={styles.submitBtn} onClick={handleSubmit}>
              Submit Quiz
            </button>
          ) : (
            <button className={styles.primaryBtn} onClick={() => setCurrentQuestionIdx(prev => prev + 1)}>
              Next Question
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
