import React, { useState, useEffect } from 'react';
import { getComments, createComment } from '../services/api';

const Comments = ({ reportId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchComments();
    }, [reportId]);

    const fetchComments = async () => {
        try {
            const response = await getComments(reportId);
            setComments(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch comments');
            setLoading(false);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        try {
            const response = await createComment(reportId, { content: newComment });
            setComments([...comments, response.data]);
            setNewComment('');
        } catch (err) {
            setError('Failed to submit comment');
        }
    };

    if (loading) return <div>Loading comments...</div>;
    if (error) return <div className='alert alert-danger'>{error}</div>;

    return (
        <div className='comments'>
            <h3>Comments</h3>
            {comments.map((comment) => (
                <div key={comment.id} className='card mb-2'>
                    <div className='card-body'>
                        <p className='card-text'>{comment.content}</p>
                        <p className='card-text'>
                            <small className='text-muted'>
                                By: {comment.user.username} | On: {new Date(comment.created_at).toLocaleString()}
                            </small>
                        </p>
                    </div>
                </div>
            ))}
            <form onSubmit={handleSubmitComment}>
                <div className='mb-3'>
                    <textarea
                        className='form-control'
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder='Add a comment...'
                        required
                    ></textarea>
                </div>
                <button type='submit' className='btn btn-primary'>Submit Cooment</button>
            </form>
        </div>
    );
};

export default Comments;