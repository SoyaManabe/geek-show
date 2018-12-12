'use strict';
 const {OperationHelper} = require('apac')
 const opHelper = new OperationHelper({
     awsId:      'AKIAIQA3Z6UDRTQASMBA',
     awsSecret:  '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',
     assocId:    'rikean-22',
     locale:     'JP',
 })

 exports.search = function(title) {
    opHelper.execute('ItemSearch', {
        'SearchIndex': 'Books',
        'Keywords': title,
        'ResponseGroup': 'ItemAttributes,Images'
    }).then((res) => {
        //console.log('Results object: \n', res.result)
        const BookUrl = res.result.ItemSearchResponse.Items.Item[0].LargeImage.URL
        console.log(BookUrl);
        res.send(BookUrl);
    }).catch((err) => {
        console.error('Something went wrong! ', err)
        res.send('Something went wrong! ');
    })
 }

