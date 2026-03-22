import { useEffect, useMemo, useReducer } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PageContainer from '../components/layout/PageContainer';
import useAuth from '../hooks/useAuth';
import HomeFeed from '../components/home/HomeFeed';
import SidebarLeft from '../components/home/SidebarLeft';
import SidebarRight from '../components/home/SidebarRight';
import {
  defaultFeedPosts,
  defaultSkills,
  homeStats,
  suggestedProfiles,
  trendingSkills,
} from '../components/home/homeData';
import {
  buildUserProfile,
  createComment,
  createPost,
  getStoredHomeState,
  saveHomeState,
  toggleLikeOnPost,
} from '../components/home/homeHelpers';

function createInitialHomeState() {
  return getStoredHomeState({
    defaultPosts: defaultFeedPosts,
    defaultSkills,
  });
}

function homeReducer(state, action) {
  switch (action.type) {
    case 'create_post':
      return {
        ...state,
        posts: [action.payload, ...state.posts],
      };
    case 'add_skill':
      return {
        ...state,
        skills: action.payload,
      };
    case 'toggle_like':
      return {
        ...state,
        posts: state.posts.map((post) =>
          post.id === action.payload.postId ? toggleLikeOnPost(post, action.payload.userId) : post,
        ),
      };
    case 'add_comment':
      return {
        ...state,
        posts: state.posts.map((post) =>
          post.id === action.payload.postId
            ? { ...post, comments: [...post.comments, action.payload.comment] }
            : post,
        ),
      };
    default:
      return state;
  }
}

export default function Home() {
  const { currentUser } = useAuth();
  const user = useMemo(() => buildUserProfile(currentUser), [currentUser]);
  const [homeState, dispatch] = useReducer(homeReducer, undefined, createInitialHomeState);

  useEffect(() => {
    saveHomeState(homeState);
  }, [homeState]);

  const stats = useMemo(
    () => ({
      ...homeStats,
      skills: homeState.skills.length,
    }),
    [homeState.skills.length],
  );

  const handlePost = ({ text, image }) => {
    dispatch({
      type: 'create_post',
      payload: createPost({
        user,
        text,
        image,
      }),
    });
  };

  const handleAddSkill = (skillName) => {
    const trimmedSkill = skillName.trim();

    if (!trimmedSkill) {
      return false;
    }

    const skillAlreadyExists = homeState.skills.some(
      (skill) => skill.toLowerCase() === trimmedSkill.toLowerCase(),
    );

    if (skillAlreadyExists) {
      return false;
    }

    dispatch({
      type: 'add_skill',
      payload: [trimmedSkill, ...homeState.skills],
    });

    return true;
  };

  const handleToggleLike = (postId) => {
    dispatch({
      type: 'toggle_like',
      payload: {
        postId,
        userId: user.id,
      },
    });
  };

  const handleAddComment = (postId, text) => {
    const trimmedText = text.trim();

    if (!trimmedText) {
      return false;
    }

    dispatch({
      type: 'add_comment',
      payload: {
        postId,
        comment: createComment({
          user,
          text: trimmedText,
        }),
      },
    });

    return true;
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-transparent pb-16 pt-6">
        <PageContainer className="space-y-6">
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr_300px]">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <SidebarLeft
                user={user}
                stats={stats}
                skills={homeState.skills}
                onAddSkill={handleAddSkill}
              />
            </div>

            <HomeFeed
              user={user}
              posts={homeState.posts}
              currentUserId={user.id}
              onPost={handlePost}
              onToggleLike={handleToggleLike}
              onAddComment={handleAddComment}
            />

            <div className="lg:sticky lg:top-24 lg:self-start">
              <SidebarRight suggestions={suggestedProfiles} trending={trendingSkills} />
            </div>
          </section>
        </PageContainer>
      </main>
      <Footer />
    </>
  );
}
