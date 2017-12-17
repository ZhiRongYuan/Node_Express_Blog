$('#submitCommet').on('click', function () {
    const contentId = $('#contentId').val();
    const content = $('#content').val();

    if (!content) {
        alert('请输入评论');
    }

    $.ajax({
        type: 'post',
        url: 'api/comment/post',
        data: {
            contentid: contentId,
            content: content
        },
        dataType: 'json',
        success: function (result) {
            const comments = result.data.comments.reverse();
            $('#commentNum').html(comments.length);
            $('#content').val('');
            let html = '';
            for (let i=0; i<comments.length; i++) {
                html+='<li><div><span class="fl">'+comments[i].username+'</span>' +
                    '<span class="fr">'+ transformTime(comments[i].postTime) +'</span></div>' +
                    '<div>'+comments[i].content+'</div></li>';
            }
            $('#list').html(html);
        }
    })
})


$.ajax({
    type: 'get',
    url: 'api/comment',
    data: {
        contentid: $('#contentId').val()
    },
    dataType: 'json',
    success: function (result) {
        const comments = result.data.comments.reverse();
        $('#commentNum').html(comments.length);
        let html = '';
        for (let i=0; i<comments.length; i++) {
            html+='<li><div><span class="fl">'+comments[i].username+'</span>' +
                '<span class="fr">'+ transformTime(comments[i].postTime) +'</span></div>' +
                '<div>'+comments[i].content+'</div></li>';
        }
        $('#list').html(html);
    }
})


function transformTime(time) {
    const d = new Date(time);
    return d.getFullYear() + '年' + (d.getMonth()+1) + '月' + d.getDate() + '日  ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()
}