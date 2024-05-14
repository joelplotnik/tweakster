import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Form,
  useNavigation,
  useActionData,
  Link,
  useNavigate,
  useRouteLoaderData,
  useRevalidator,
} from 'react-router-dom';
import ReactQuill from 'react-quill';
import Select from 'react-select';

import { API_URL } from '../../../constants/constants';
import ConfirmationModal from '../../UI/Modals/ConfirmationModal';
import Dropzone from '../../UI/Dropzone';
import ImagesPreview from '../../UI/ImagesPreview';
import SubscribePrompt from '../../UI/SubscribePrompt';

import classes from './PieceForm.module.css';
import 'react-quill/dist/quill.snow.css';
import './Quill.css';

const PieceForm = ({ type, piece, tweakText }) => {
  const data = useActionData();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const [showModal, setShowModal] = useState(false);
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [isTitleValid, setIsTitleValid] = useState(
    piece && piece.title ? true : false
  );
  const token = useRouteLoaderData('root');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubePreview, setYoutubePreview] = useState('');
  const [images, setImages] = useState([]);
  const submissionMethod = type === 'new' || type === 'tweak' ? 'POST' : 'PUT';
  const revalidator = useRevalidator();
  const [quillContent, setQuillContent] = useState(() => {
    if (type === 'edit' && piece && piece.content) {
      return piece.content;
    } else if (type === 'tweak' && piece && piece.content && tweakText) {
      return piece.content;
    } else {
      return '';
    }
  });

  const handleModalToggle = () => {
    setShowModal(!showModal);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    formData.append('piece[title]', formData.get('title'));
    formData.append('piece[content]', quillContent);
    formData.append('piece[youtube_url]', formData.get('youtubeUrl'));

    for (let i = 0; i < images.length; i++) {
      formData.append('piece[images][]', images[i]);
    }

    if (type === 'tweak' && piece) {
      formData.append('piece[parent_piece_id]', piece.id);
    }

    let requestUrl;

    if (submissionMethod === 'PUT') {
      const piece_id = piece.id;
      requestUrl = `${API_URL}/channels/${selectedChannel}/pieces/${piece_id}`;
    } else {
      requestUrl = `${API_URL}/channels/${selectedChannel}/pieces`;
    }

    try {
      const response = await fetch(requestUrl, {
        method: submissionMethod,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.status === 422) {
        const errorData = await response.json();
        toast.error(errorData.errors[0]);
        return response;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Could not create piece');
      }

      const newPiece = await response.json();

      revalidator.revalidate();

      return navigate(`/channels/${selectedChannel}/pieces/${newPiece.id}`);
    } catch (error) {
      console.error('Error: ', error.message);
      toast.error('Error submitting piece');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${API_URL}/channels/${selectedChannel}/pieces/${piece.id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Could not delete piece');
      }

      return navigate('/');
    } catch (error) {
      console.error('Error: ', error.message);
      toast.error('Error deleting piece');
    }
  };

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await fetch(`${API_URL}/subscriptions`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch channels');
        }

        const channelsData = await response.json();
        setChannels(channelsData);
      } catch (error) {
        console.error('Error: ', error.message);
        toast.error('Error fetching channels');
      }
    };

    fetchChannels();
  }, [token]);

  const onSelectChangeHandler = (event) => {
    const selectedId = event.value;
    const newUrl = `/channels/${selectedId}/pieces/new`;
    window.history.replaceState(null, null, newUrl);
    setSelectedChannel(selectedId);
  };

  const handleTitleChange = (event) => {
    const title = event.target.value;
    setIsTitleValid(!!title);
  };

  const convertToAbsoluteLinks = (content) => {
    return content.replace(/<a href="(.*?)"/g, (match, p1) => {
      if (!p1.startsWith('http://') && !p1.startsWith('https://')) {
        return `<a href="https://${p1}" target="_blank"`;
      }
      return match;
    });
  };

  useEffect(() => {
    // Convert relative links to absolute links before rendering
    const contentWithAbsoluteLinks = convertToAbsoluteLinks(quillContent);
    setQuillContent(contentWithAbsoluteLinks);
  }, [quillContent]);

  let toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'], // toggled buttons
    [],
    ['link', 'blockquote'], // quotes
    [],
    [{ color: [] }, { background: [] }], // dropdown with defaults from theme
    [],
    [{ list: 'ordered' }, { list: 'bullet' }], // lists
    [],
    ['clean'], // remove formatting button
  ];

  const modules = {
    toolbar: toolbarOptions,
  };

  const handleYoutubeUrlChange = (event) => {
    setYoutubeUrl(event.target.value);
    updateYoutubePreview(event.target.value);
  };

  const updateYoutubePreview = (url) => {
    const videoId = url.match(/[?&]v=([^?&]+)/);

    if (videoId && videoId[1]) {
      const videoPreviewUrl = `https://www.youtube.com/embed/${videoId[1]}`;
      setYoutubePreview(videoPreviewUrl);
    } else {
      setYoutubePreview('');
    }
  };

  useEffect(() => {
    const urlParts = window.location.pathname.split('/');
    const channel_id = urlParts[2];

    setSelectedChannel(channel_id);

    if (type === 'edit' && piece && piece.youtube_url) {
      setYoutubeUrl(piece.youtube_url);
      updateYoutubePreview(piece.youtube_url);
    }
  }, [piece, type]);

  const customSelectStyles = {
    control: (baseStyles, state) => ({
      ...baseStyles,
      boxShadow: 'none',
      width: 200,
      '&:hover': {
        borderColor: 'black',
      },
      '&:focus': {
        borderColor: 'black',
        outline: 'none',
      },
    }),
  };

  const customSelectTheme = (theme) => ({
    ...theme,
    borderRadius: 5,
    colors: {
      ...theme.colors,
      primary: '#333333',
      primary75: 'lightgrey',
      primary50: 'lightgrey',
      primary25: 'lightgrey',
    },
  });

  return (
    <>
      {channels.length > 0 && (
        <>
          <Form
            method={submissionMethod}
            className={classes['form-container']}
            onSubmit={handleSubmit}
          >
            {data && data.errors && (
              <ul className={classes['form-error-list']}>
                {Object.values(data.errors).map((err) => (
                  <li className={classes['form-error']} key={err}>
                    {err}
                  </li>
                ))}
              </ul>
            )}
            <div className={classes['form-select-container']}>
              {channels.length > 0 && (
                <Select
                  className={classes['form-select']}
                  theme={customSelectTheme}
                  styles={customSelectStyles}
                  id="channelSelect"
                  options={channels.map((channel) => ({
                    value: channel.id,
                    label: channel.name,
                  }))}
                  defaultValue={
                    type === 'edit' || type === 'tweak'
                      ? { value: selectedChannel, label: piece.channel.name }
                      : selectedChannel
                      ? {
                          value: selectedChannel,
                          label: channels.find(
                            (channel) =>
                              channel.id === parseInt(selectedChannel, 10)
                          ).name,
                        }
                      : null
                  }
                  isDisabled={type === 'edit' || type === 'tweak'}
                  onChange={onSelectChangeHandler}
                  placeholder="Choose a channel"
                />
              )}
            </div>
            <input
              className={classes['form-title']}
              type="text"
              id="title"
              name="title"
              placeholder="Title"
              defaultValue={piece && type === 'edit' ? piece.title : ''}
              onChange={handleTitleChange}
              required
            />
            <ReactQuill
              modules={modules}
              className={classes['form-quill']}
              id="content"
              name="content"
              value={quillContent}
              onChange={(value) => {
                setQuillContent(value);
              }}
              placeholder="Text"
            />
            <p className={classes['optional-instruction']}>Optional:</p>
            <hr className={classes.divider} />
            <input
              className={classes['form-youtube-input']}
              type="text"
              id="youtubeUrl"
              name="youtubeUrl"
              placeholder="YouTube video link (e.g., https://www.youtube.com/watch?v=VIDEO_ID)"
              defaultValue={
                type === 'edit' && piece ? piece.youtube_url : youtubeUrl
              }
              onChange={handleYoutubeUrlChange}
            />
            {youtubePreview && (
              <iframe
                className={classes['form-youtube-preview']}
                src={youtubePreview}
                title="YouTube Preview"
                allowFullScreen
              ></iframe>
            )}
            {type === 'edit' && piece.images && piece.images.length >= 0 ? (
              <>
                <p className={classes.note}>
                  Note: Editing or removal of images is not available.
                </p>
                <ImagesPreview imageUrls={piece.images} />
              </>
            ) : (
              <Dropzone onImagesChange={(newImages) => setImages(newImages)} />
            )}
            <button
              type="submit"
              className={`${classes['form-submit-button']} ${
                isSubmitting || !selectedChannel || !isTitleValid
                  ? classes.disabled
                  : ''
              }`}
              disabled={isSubmitting || !selectedChannel}
            >
              {isSubmitting
                ? 'Submitting'
                : type === 'new'
                ? 'Create'
                : 'Submit'}
            </button>
          </Form>
          <div className={classes['delete-button-container']}>
            {type === 'edit' && (
              <div className={classes['delete-button-container']}>
                <Link
                  className={classes['delete-button']}
                  onClick={() => handleModalToggle()}
                >
                  Delete piece
                </Link>
              </div>
            )}
          </div>
          {showModal && (
            <ConfirmationModal
              onConfirm={handleDelete}
              onClick={handleModalToggle}
            />
          )}
        </>
      )}
      {channels.length === 0 && isSubmitting && <SubscribePrompt />}
    </>
  );
};

export default PieceForm;
