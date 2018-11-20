'use strict';
import $ from 'jquery';

const buttonSelfComment = $('#self-comment-button');
buttonSelfComment.click(() => {
    const postId = buttonSelfComment.data('book-id');
    const userId = buttonSelfComment.data('user-id');
    const comment = prompt('Can comment in 255 letters.');
    if (comment) {
        $.post(`/books/${postId}/users/${userId}/comments`,
            { comment: comment },
            (data) => {
                $('#self-comment').text(data.comment);
            });
    }
});