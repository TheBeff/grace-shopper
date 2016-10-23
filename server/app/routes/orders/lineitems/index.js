var router = require('express').Router();
const LineItem = require('../../../../db').models.LineItem;

module.exports = router;

router.post('/', function(req, res, next){
	LineItem.create({
		price: req.body.price,
		quantity: req.body.quantity
	})
	.then(function(lineitem){
		lineitem.setOrder(req.body.orderId);
		return lineitem;
	})
	.then(function(lineitem){
		lineitem.setProduct(req.body.productId);
		return lineitem;
	})
	.then(function(lineitem){
		res.send(lineitem);
	})
	.catch(next);
});

router.delete('/:id', function(req, res, next){
	LineItem.destroy({
		where: {
			id: req.params.id
		}
	})
	.then(function(){
		console.log('deleted');
	})
	.catch(next);
});

//if the lineup post has the same product, it updates the lineitem

router.put('/:id', function(req, res, next){
	LineItem.update({
		quantity: req.body.quantity
	},{
		where: {id: req.params.id}
	})
	.then(function(){
		console.log('lineitem ' + req.params.id + ' updated');
		res.sendStatus(200);
	})
	.catch(next);
});
