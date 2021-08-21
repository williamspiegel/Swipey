import {useMutation, useQueryClient} from 'react-query';
import useLoggedInAction from './useLoggedInAction';
import {useContext, useState} from 'react';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

export default function useVote(id: string) {
  //either downvote (-1), upvote (1), or no vote (0)
  const queryClient = useQueryClient();

  const [vote, setVote] = useState(0);
  const {tok} = useContext(AuthContext);
  const action = useLoggedInAction();

  const up = useMutation(
    async () =>
      action(() =>
        axios({
          method: 'post',
          url: `https://oauth.reddit.com/api/vote?dir=1&id=${id}`,
          headers: {
            Authorization: `bearer ${tok}`,
            'User-Agent': 'Swipey for Reddit',
          },
        }),
      ),
    {
      onMutate: () => {
        setVote(1);
      },

      onError: () => {
        setVote(0);
      },

      onSettled: () => {},
    },
  );
  const down = useMutation(
    async () =>
      action(() =>
        axios({
          method: 'post',
          url: `https://oauth.reddit.com/api/vote?dir=-1&id=${id}`,
          headers: {
            Authorization: `bearer ${tok}`,
            'User-Agent': 'Swipey for Reddit',
          },
        }),
      ),
    {
      onMutate: () => {
        setVote(-1);
      },

      onError: () => {
        setVote(0);
      },

      onSettled: () => {},
    },
  );
  const no = useMutation(
    async () =>
      action(() =>
        axios({
          method: 'post',
          url: `https://oauth.reddit.com/api/vote?dir=0&id=${id}`,
          headers: {
            Authorization: `bearer ${tok}`,
            'User-Agent': 'Swipey for Reddit',
          },
        }),
      ),
    {
      onMutate: () => {
        setVote(0);
      },

      onError: () => {
        setVote(0);
      },

      onSettled: () => {},
    },
  );
  const upvote = async () => {
    action(() => {
      console.log('upvote hit');
      vote !== 1 ? up.mutate() : no.mutate();
    });
  };
  const downvote = async () => {
    action(() => {
      vote !== -1 ? down.mutate() : no.mutate();
    });
  };

  return [upvote, downvote, vote];
}
