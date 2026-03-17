import { createId, readDatabase, updateDatabase } from '../data/dataStore.js';

function ensureReviews(currentDatabase) {
  if (!Array.isArray(currentDatabase.reviews)) {
    currentDatabase.reviews = [];
  }

  return currentDatabase.reviews;
}

function hydrateReview(review, skills) {
  const skill = skills.find((item) => item.id === review.skillId);

  return {
    ...review,
    skillTitle: skill?.title || review.skillTitle || 'Unknown skill',
  };
}

function refreshSkillRating(currentDatabase, skillId) {
  const reviews = ensureReviews(currentDatabase).filter((review) => review.skillId === skillId);
  const reviewCount = reviews.length;
  const averageRating = reviewCount
    ? Number(
        (
          reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviewCount
        ).toFixed(1),
      )
    : 0;

  currentDatabase.skills = currentDatabase.skills.map((skill) =>
    skill.id === skillId
      ? {
          ...skill,
          rating: averageRating || skill.rating || 0,
          reviewCount,
        }
      : skill,
  );
}

export async function getSkillReviews(req, res, next) {
  try {
    const database = await readDatabase();
    const reviews = ensureReviews(database)
      .filter((review) => review.skillId === req.params.skillId)
      .map((review) => hydrateReview(review, database.skills))
      .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());

    return res.json(reviews);
  } catch (error) {
    return next(error);
  }
}

export async function createReview(req, res, next) {
  try {
    const { skillId, rating, comment = '' } = req.body || {};
    const normalizedRating = Number(rating);

    if (!skillId || !Number.isFinite(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
      return res.status(400).json({ error: 'skillId and a rating between 1 and 5 are required.' });
    }

    let createdReview = null;

    const database = await updateDatabase((currentDatabase) => {
      const reviews = ensureReviews(currentDatabase);
      const skill = currentDatabase.skills.find((item) => item.id === skillId);

      if (!skill) {
        throw Object.assign(new Error('Skill not found.'), { status: 404 });
      }

      const eligibleBooking = currentDatabase.bookings.find(
        (booking) =>
          booking.skillId === skillId &&
          booking.studentId === req.user.id &&
          booking.status === 'completed',
      );

      if (!eligibleBooking && req.user.role !== 'admin') {
        throw Object.assign(
          new Error('Only users with a completed booking can review this skill.'),
          { status: 403 },
        );
      }

      const alreadyReviewed = reviews.some(
        (review) => review.skillId === skillId && review.reviewerId === req.user.id,
      );

      if (alreadyReviewed) {
        throw Object.assign(new Error('You have already reviewed this skill.'), { status: 409 });
      }

      createdReview = {
        id: createId('review'),
        skillId,
        bookingId: eligibleBooking?.id || '',
        reviewerId: req.user.id,
        reviewerName: req.user.name,
        revieweeId: skill.instructorId,
        rating: normalizedRating,
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      reviews.unshift(createdReview);
      refreshSkillRating(currentDatabase, skillId);
      return currentDatabase;
    });

    return res
      .status(201)
      .json(hydrateReview(createdReview, database.skills));
  } catch (error) {
    return next(error);
  }
}

export async function updateReview(req, res, next) {
  try {
    const { rating, comment } = req.body || {};
    const normalizedRating = Number(rating);
    let updatedReview = null;

    const database = await updateDatabase((currentDatabase) => {
      const reviews = ensureReviews(currentDatabase);

      currentDatabase.reviews = reviews.map((review) => {
        if (review.id !== req.params.id) {
          return review;
        }

        if (review.reviewerId !== req.user.id && req.user.role !== 'admin') {
          throw Object.assign(new Error('You do not have permission to update this review.'), {
            status: 403,
          });
        }

        if (
          rating !== undefined &&
          (!Number.isFinite(normalizedRating) || normalizedRating < 1 || normalizedRating > 5)
        ) {
          throw Object.assign(new Error('rating must be between 1 and 5.'), { status: 400 });
        }

        updatedReview = {
          ...review,
          rating: rating === undefined ? review.rating : normalizedRating,
          comment: comment === undefined ? review.comment : String(comment).trim(),
          updatedAt: new Date().toISOString(),
        };

        return updatedReview;
      });

      if (updatedReview) {
        refreshSkillRating(currentDatabase, updatedReview.skillId);
      }

      return currentDatabase;
    });

    if (!updatedReview) {
      return res.status(404).json({ error: 'Review not found.' });
    }

    return res.json(hydrateReview(updatedReview, database.skills));
  } catch (error) {
    return next(error);
  }
}

export async function deleteReview(req, res, next) {
  try {
    let deletedReview = null;

    const database = await updateDatabase((currentDatabase) => {
      const reviews = ensureReviews(currentDatabase);
      deletedReview = reviews.find((review) => review.id === req.params.id) || null;

      if (
        deletedReview &&
        deletedReview.reviewerId !== req.user.id &&
        req.user.role !== 'admin'
      ) {
        throw Object.assign(new Error('You do not have permission to delete this review.'), {
          status: 403,
        });
      }

      currentDatabase.reviews = reviews.filter((review) => review.id !== req.params.id);

      if (deletedReview) {
        refreshSkillRating(currentDatabase, deletedReview.skillId);
      }

      return currentDatabase;
    });

    if (!deletedReview) {
      return res.status(404).json({ error: 'Review not found.' });
    }

    return res.json({
      success: true,
      deletedReviewId: deletedReview.id,
    });
  } catch (error) {
    return next(error);
  }
}
