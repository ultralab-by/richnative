# RichNative


Before the closing `</body>` tag, add js:
```
<script src="https://adx1js.s3.amazonaws.com/nativeads.js"></script>
<script>
(function() {	
	NativeAds.init({
	    'pubid': 74488,
	    'siteid': 150319
	});
})();
</script>
```
Add an ad container where you want to place native ads:

```
<div class="native-ads" data-rows="2"></div>
```

#### js params
`'pubid'` - Publisher id.

`'siteid'`- Site id.

`'endpoint'`- Endpoint URL, optional parameter. (String)

`'test'`- Optional parameter for testing ad location `'test': 1`

#### ad container params
`data-rows=` - Number of rows of ads

