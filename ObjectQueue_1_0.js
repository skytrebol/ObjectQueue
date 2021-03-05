/*
 *  MCqueue module Javascript
 *  MovieClip queue
 */

(function(window) {
    //
    // キューの固有ID
    //
    var _ObjectQueue_global_qid = 0;

    //
    // コンストラクタ
    //
    //
    ObjectQueue = function(_qoption) {

        this._QOPT_NONE      = 0; 
        // キュー要素がデキューされるとき、当該キュー要素の
        // プロパティを削除するか？（１：削除、非１：残す）（private）
        this._QOPT_DEQ_CLEAN = 1; 
        
        //省略引数初期値
        if( _qoption == null ){
            _qoption = this._QOPT_DEQ_CLEAN;
        }

        //主処理

        // キューの固有ID設定(private)
        this._qid = (_ObjectQueue_global_qid++);;
        // キュー内の要素数(private)
        this._qlen = 0;
        // キュー先頭要素へのポインタ(private)
        this._qhead = null;
        // キュー末尾要素へのポインタ(private)
        this._qtail = null;
        // キューのオプション設定値(private)
        this.qoption = _qoption;
        

        // 利用者がキューのマスク設定の使用／未使用を選択するためのシンボル(public)
        this.ENABLE_MASK  = 1; 
        this.DISABLE_MASK = 0; 
        this.current_mask = "default";

        // キュー要素のマスク設定内部状態（private）
        this.MASKED   = 1; 
        this.UNMASKED = 0; 

        // 最も近い、最も遠い、を示すためのシンボル
        this.NEAREST  = true;
        this.FARTHEST = false; 
        
        // 距離の定義（マンハッタン距離、ユークリッド距離）、を示すためのシンボル
        this.MANHATTAN = true; 
        this.EUCLID = false; 
        
        // x座標を示すプロパティkey値、y座標を示すプロパティkey値（初期値）
        this.x_key = "x";
        this.y_key = "y";
        

        // 増加方向ソート、減少方向ソート、を示すためのシンボル
        this.INC_SORT = true; 
        this.DEC_SORT = false; 
        
        this.sort_type = 0; //0:auto, 1:bubble, 2:quick
    }
    
    //
    // 本クラスのバージョン
    //
    ObjectQueue.prototype.get_version = function() {
        return "1.25";
    }
    

    //
    // enqueueメソッド:( mask省略可 )
    //
    ObjectQueue.prototype.enqueue = function(mc, mask) {
        //省略引数初期値
        if( mask == null ){
            mask=this.ENABLE_MASK;
        }
        
        //主処理
        if(mc){
            //初期化
            if(! mc.queued)mc.queued = 0;
            if(! mc.q_previous)mc.q_previous = new Array();
            if(! mc.q_next    )mc.q_next     = new Array();
            if(! mc.q_mask    )mc.q_mask     = new Array();
            if(! mc.o_mask    )mc.o_mask     = new Object();
            
            //キューに要素を追加する
            mc.queued++;
            
            mc.q_previous[this._qid] = this._qtail;
            mc.q_next[this._qid]     = null;
            
            mc.q_mask[this._qid]     = mask;

            if(this._qlen==0){
                this._qhead       = mc;
            }else{
                this._qtail.q_next[this._qid]  = mc;
            }
            this._qtail       = mc;
            this._qlen++;
        }else{
            trace("ERROR: enqueue null mc.");
        }
    }
    
    
    //
    // dequeueメソッド:( target,val省略可 )
    //
    ObjectQueue.prototype.dequeue = function(target,val) {
        var mc;
        
        //省略引数初期値
        if(target == null || val == null){
            target = "";
        }
        
        //キューに要素が無い
        if (this._qlen<=0) {
            return null;
        }
        
        //主処理
        if(target != ""){
            //taeget,val指定がある場合は、プロパティ名targetの値がvalである最初の要素を探す
            
            for (mc=this._qhead ; mc ; mc=mc.q_next[this._qid]){
                if(mc[target] == val){
                    if( this._qhead == mc ){
                        this._qhead = mc.q_next[this._qid];
                        if( mc.q_next[this._qid] ){
                            mc.q_next[this._qid].q_previous[this._qid] = null;
                        }
                    }else{
                        mc.q_previous[this._qid].q_next[this._qid] = mc.q_next[this._qid];
                        if( mc.q_next[this._qid] ){
                            mc.q_next[this._qid].q_previous[this._qid] = mc.q_previous[this._qid];
                        }
                    }
                    if( this._qtail == mc ){
                        this._qtail = mc.q_previous[this._qid];
                    }
                    this._qlen--;
                    
                    mc.q_previous[this._qid] = null;
                    mc.q_next[this._qid]     = null;
                    mc.q_mask[this._qid]     = this.UNMASKED;
                    if((-- mc.queued)==0 &&
                       (this.qoption & this.QOPT_DEQ_CLEAN) ){
                        delete mc.q_previous;
                        delete mc.q_next;
                        delete mc.q_mask;
                        mc.q_previous = null;
                        mc.q_next     = null;
                        mc.q_mask     = null;
                    }
                    
                    return mc;
                }
            }
            return null;
        }else{
            //taeget,val指定が無い場合
            
            var ret = this._qhead;
            
            if( ret == null ){
                return null;
            }
            
            this._qhead = this._qhead.q_next[this._qid];
            if(this._qhead){
                this._qhead.q_previous[this._qid] = null;
            }else{
                this._qtail = null;
            }
            
            ret.q_previous[this._qid] = null;
            ret.q_next[this._qid]     = null;
            ret.q_mask[this._qid]     = this.UNMASKED;
            this._qlen--;
            
            if((-- ret.queued)==0 &&
               (this.qoption & this.QOPT_DEQ_CLEAN)){
                delete ret.q_previous;
                delete ret.q_next;
                delete ret.q_mask;
                mc.q_previous = null;
                mc.q_next     = null;
                mc.q_mask     = null;
            }
            return ret;
        }
    }
    
    // キュー内の要素を全て削除（dequeue）する
    ObjectQueue.prototype.removeall = function(mask) {
        return this._removeall(mask,0);
    }
    ObjectQueue.prototype.deleteall = function(mask) {
        return this._removeall(mask,1);
    }
    ObjectQueue.prototype._removeall = function(mask,_delete) {
        //省略引数初期値
        if( mask == null ){
            mask = this.DISABLE_MASK;
        }
        
        //主処理
        var len = this._qlen;
        for (var i = 0; i < len ; i++){
            if ( mask == this.DISABLE_MASK || this._qhead[this._qid] == this.MASKED ){
                var obj = this.dequeue();
                if(_delete){
                    delete obj;
                }
            }
        }
    }
    
    //
    // Mask Handler
    // マスク設定を操作するためのメソッド群
    //
    //
    
    // キュー要素にMaskを設定
    ObjectQueue.prototype.mask = function(mc) {
        if(mc)mc.q_mask[this._qid] = this.MASKED; 
    }
    
    // キュー要素にUnMaskを設定
    ObjectQueue.prototype.unmask = function(mc) {
        if(mc)mc.q_mask[this._qid] = this.UNMASKED; 
    }
    
    // key,valに合致するプロパティを持つキュー要素にMaskを設定
    ObjectQueue.prototype.setmask = function(key,val) {
        var mc;
        for (mc=this._qhead; mc ; mc=mc.q_next[this._qid]){
            if ( mc[key] == val ) mc.q_mask[this._qid] = this.MASKED; 
        }
    }
    
    // key,valに合致するプロパティを持つキュー要素にUnMaskを設定
    ObjectQueue.prototype.resetmask = function(key,val) {
        var mc;
        for (mc=this._qhead; mc ; mc=mc.q_next[this._qid]){
            if ( mc[key] == val ) mc.q_mask[this._qid] = this.UNMASKED; 
        }
    }
    
    // key,valに合致するプロパティを持つキュー要素にUnMaskを設定
    ObjectQueue.prototype.setmaskall = function() {
        var mc;
        for (mc=this._qhead; mc ; mc=mc.q_next[this._qid]){
            mc.q_mask[this._qid] = this.MASKED; 
        }
    }
    
    // キュー内の全てのキュー要素にUnMaskを設定
    ObjectQueue.prototype.resetmaskall = function() {
        var mc;
        for (mc=this._qhead; mc ; mc=mc.q_next[this._qid]){
            mc.q_mask[this._qid] = this.UNMASKED; 
        }
    }
    
    // Maskの切替
    // Maskの切替: current_maskを取得
    ObjectQueue.prototype.get_current_mask = function() {
        return this.current_mask;
    }
    // Maskの切替: current_maskに保存して新しい(指定)マスクを初期化
    ObjectQueue.prototype.new_mask = function(_mask_id, _init_mask) {
        if( ! _init_mask ){
            _init_mask = this.UNMASKED;
        }
        for (mc=this._qhead; mc ; mc=mc.q_next[this._qid]){
            mc.o_mask[this.current_mask] = mc.q_mask[this._qid];
            mc.q_mask[this._qid] = _init_mask;
        }
        this.current_mask = _mask_id;
    }
    // Maskの切替: _mask_id(省略時current_mask)に保存
    ObjectQueue.prototype.save_mask = function(_mask_id) {
        if(! _mask_id){
            _mask_id = this.current_mask;
        }
        for (mc=this._qhead; mc ; mc=mc.q_next[this._qid]){
            mc.o_mask[_mask_id] = mc.q_mask[this._qid];
        }
    }
    // Maskの切替: _mask_idを読込
    ObjectQueue.prototype.load_mask = function(_mask_id) {
        for (mc=this._qhead; mc ; mc=mc.q_next[this._qid]){
            if(typeof(mc.o_mask[_mask_id])=="undefined"){mc.o_mask[_mask_id]=this.UNMASKED;} //initialize
            mc.q_mask[this._qid] = mc.o_mask[_mask_id];
        }
        this.current_mask = _mask_id;
    }
    // Maskの切替: current_maskに保存して_mask_idを読込
    ObjectQueue.prototype.change_mask = function(_mask_id) {
        for (mc=this._qhead; mc ; mc=mc.q_next[this._qid]){
            mc.o_mask[this.current_mask] = mc.q_mask[this._qid];
            if(typeof(mc.o_mask[_mask_id])=="undefined"){mc.o_mask[_mask_id]=this.UNMASKED;} //initialize
            mc.q_mask[this._qid] = mc.o_mask[_mask_id];
        }
        this.current_mask = _mask_id;
    }

    //
    // Reference Handler
    // キュー内のキュー要素への参照を得るためのメソッド群
    //
    //
    
    // キュー先頭のキュー要素への参照を取得
    ObjectQueue.prototype.head = function(mask) {
        //省略引数初期値
        if( mask == null ){
            mask =this.DISABLE_MASK;
        }
        
        //主処理
        if(this._qhead == null){
            return this._qhead;
        }

        if(mask == this.ENABLE_MASK && this._qhead.q_mask[this._qid] == this.UNMASKED){
            return this.next(this._qhead,this.ENABLE_MASK);
        }else{
            return this._qhead;
        }
    }

    // キュー末尾のキュー要素への参照を取得
    ObjectQueue.prototype.tail = function(mask) {
        //省略引数初期値
        if( mask == null ){
            mask = this.DISABLE_MASK;
        }
        
        //主処理
        if(mask == this.ENABLE_MASK && this._qtail.q_mask[this._qid] == this.UNMASKED){
            return this._qtail.previous(this.ENABLE_MASK);
        }else{
            return this._qtail;
        }
    }

    // 指定のキュー要素の次のキュー要素への参照を取得
    ObjectQueue.prototype.next = function(mc,mask) {
        //省略引数初期値
        if( mask == null ){
            mask = this.DISABLE_MASK;
        }

        //主処理
        if(mc){
            mc = mc.q_next[this._qid];
            if(mask==this.ENABLE_MASK){
                while ( mc && mc.q_mask[this._qid]==this.UNMASKED ) mc=mc.q_next[this._qid];
            }
            return mc;
        }else{
            return null;
        }
    }
    
    // 指定のキュー要素の前のキュー要素への参照を取得
    ObjectQueue.prototype.previous = function(mc,mask) {
        //省略引数初期値
        if( mask == null ){
            mask = this.DISABLE_MASK;
        }
        
        //主処理
        if(mc){
            mc = mc.q_previous[this._qid];
            if(mask==this.ENABLE_MASK){
                while (  mc && mc.q_mask[this._qid]==this.UNMASKED ){ mc=mc.q_previous[this._qid]};
            }
            return mc;
        }else{
            return null;
        }
    }
    
    
    // キューの先頭から指定数個目のキュー要素への参照を返す
    ObjectQueue.prototype.refer = function(num) {
        var i;
        var mc;
        
        if(num<0 || num>this._qlen-1){
            return null;
        }
        
        for (i=0, mc=this._qhead; i < num; i++ ){
            mc=mc.q_next[this._qid];
        }
        return mc;
    }
    

    //
    // Other Handler
    // その他メソッド群
    //
    //
    
    // キュー内の要素数を返す
    ObjectQueue.prototype.length = function(mask) {
        //省略引数初期値
        if( mask == null ){
            mask = this.DISABLE_MASK;
        }
        
        //主処理
        if(mask==this.ENABLE_MASK){
            var num = 0;
            for (var mc=this._qhead ; mc ; mc=mc.q_next[this._qid]){
                if(mc.q_mask[this._qid]==this.MASKED)num++;
            }
            return num;
        }else{
            return this._qlen;
        }
    }

    // キュー内の、key,valに一致する要素の数を返す
    ObjectQueue.prototype.count = function(key,val,mask) {
        var mc;
        //省略引数初期値
        if( mask == null ){
            mask = this.DISABLE_MASK;
        }

        //主処理
        var num=0;
        for (mc=this._qhead; mc ; mc=mc.q_next[this._qid]){
            if ( mc[key] == val && (mask==this.DISABLE_MASK || mc.q_mask[this._qid] == this.MASKED) ) num++;
        }
        return num;
    }

    // キュー内の、key,valに一致する最初の要素への参照を返す（但し、start_mcで指定された要素以降から探す）
    ObjectQueue.prototype.search = function(key,val,mask, start_mc) {
        //省略引数初期値
        if( mask == null ){
            mask = this.DISABLE_MASK;
        }
        var mc=this._qhead;
        if(start_mc)mc = start_mc;
        
        //主処理
        for ( ; mc ; mc=mc.q_next[this._qid]){
            if ( mc[key] == val && (mask==this.DISABLE_MASK || mc.q_mask[this._qid] == this.MASKED) ) return mc;
        }
        return null;
    }
    
    // キュー内の、key,valに一致する最初の要素への参照を返す（但し、startで指定された個数目以降から探す）
    ObjectQueue.prototype.search_index = function(key,val,mask,start) {
        var i=0;
        var mc=this._qhead
        
        //省略引数初期値
        if( mask == null ){
            mask = this.DISABLE_MASK;
        }
        if( start == null ){
            start = -1;
        }
        
        //主処理
        if(start>-1){
            i  = start;
            mc = refer(i);
        }
        for ( ; mc ; i++, mc=mc.q_next[this._qid]){
            if ( mc[key] == val && (mask==this.DISABLE_MASK || mc.q_mask[this._qid] == this.MASKED) ) return i;
        }

        return -1;
    }

    // キュー内の、keyに一致するプロパティの値が最も小さい要素を返す
    ObjectQueue.prototype.min = function(key, mask) {
        return this._minmax(key,true,mask);
    }

    // キュー内の、keyに一致するプロパティの値が最も大きい要素を返す
    ObjectQueue.prototype.max = function(key, mask) {
        return this._minmax(key,false,mask);
    }
    
    // 最大値、最小値を探す内部関数
    ObjectQueue.prototype._minmax = function(key, comparative, mask ) {
        //省略引数初期値
        if( mask == null ){
            mask = this.DISABLE_MASK;
        }

        //主処理
        if(this._qlen == 0 )return null;
        if(this._qlen == 1 )return this._qhead;
        
        var min = this._qhead[key];
        var min_mc = this._qhead;
        var limit = 0;
        var mc=this._qhead.q_next[this._qid];
        
        if(mask == this.ENABLE_MASK && this._qhead.q_mask[this._qid] == this.UNMASKED){
            min_mc = null;
            
            for ( ; mc ; mc=mc.q_next[this._qid]) {
                if(mc.q_mask[this._qid] == this.MASKED){
                    min_mc = mc;
                    min = mc[key];
                    mc=mc.q_next[this._qid];
                    break;
                }
            }
        }
        
        for ( ; mc ; mc=mc.q_next[this._qid]) {
            var val = Number(mc[key]);
            if ( (val < min  ) == comparative && (mask==this.DISABLE_MASK || mc.q_mask[this._qid] == this.MASKED) ){
                min = val;
                min_mc = mc;
            }
        }
        return min_mc;
    }
    
    //
    // 二次元マップ上要素向け、拡張機能
    //
    //
    //
    
    // x座標を示すプロパティkey値、y座標を示すプロパティkey値の設定変更
    ObjectQueue.prototype.set_position_search_key = function( xval, yval ) {
        this.x_key = xval;
        this.y_key = yval;
    }
    
    // search closest/farthest Movie Clip
    // 最も近い、最も遠い、キュー要素を探すサーチ関数
    ObjectQueue.prototype.position_search = function( mc, comparative, mask, manhattan ) {
        //省略引数初期値
        if( mask == null ){
            mask = this.DISABLE_MASK;
        }
        if( manhattan == null ){
            manhattan = this.EUCLID;
        }
        
        //主処理
        /* nothing or mc itself only */
        if(this._qlen < 2 )return null;
        if(mask == this.ENABLE_MASK && length(mask) < 2 )return null;
        
        /* search first mc */
        var min;
        var min_tc = null;
        var tc;
        for (tc=this._qhead; tc ; tc=tc.q_next[this._qid]){
            if(tc != mc && (mask == this.DISABLE_MASK || tc.q_mask[this._qid]==this.MASKED )){
                min = mlength(tc,mc,manhattan);
                min_tc = tc;
                break;
            }
        }
        if (min_tc == null){
            /* fatal error */
            return null;
        }
        
        for ( ; tc ; tc=tc.q_next[this._qid]) {
            var manhl = mlength(tc,mc,manhattan); 
            if ( tc != mc && (manhl < min) == comparative && (mask == this.DISABLE_MASK || tc.q_mask[this._qid]==this.MASKED )){
                min    = manhl;
                min_tc = tc;
            }
        }
        return min_tc;
    }
    

    // mcで指定された要素から、manhminからmanhmaxの間の距離にある別要素の数を返す
    ObjectQueue.prototype.position_range_search_count = function(mc, manhmin, manhmax, mask, manhattan) {
        //省略引数初期値
        if( mask == null ){
            mask = this.DISABLE_MASK;
        }
        if( manhattan == null ){
            manhattan = this.EUCLID;
        }
        
        //主処理
        if(this._qlen < 2 )return 0; // nothing or mc itself only
        
        var num = 0;
        if(manhattan == this.EUCLID){
            manhmin *= manhmin;
            manhmax *= manhmax;
        }
        for (var tc=this._qhead.q_next[this._qid] ; tc ; tc=tc.q_next[this._qid]) {
            var manhl = mlength(tc,mc,manhattan); 
            if ( tc != mc && manhl >= manhmin && manhl <=manhmax && (mask==this.DISABLE_MASK || tc.q_mask[this._qid] == this.MASKED))
            num ++;
        }
        return num;
    }
    
    
    // 要素aと要素bの距離を返す
    ObjectQueue.prototype.mlength = function(a, b, manhattan) {
        //省略引数初期値
        if( manhattan == null ){
            manhattan = this.EUCLID;
        }
        
        //主処理
        if(manhattan == this.MANHATTAN){
            // manhattan length
            return this.abs(a[this.x_key] - b[this.x_key]) + this.abs(a[this.y_key] - b[this.y_key]);
        }else{
            // euclid length
            return (a[this.x_key] - b[this.x_key])*(a[this.x_key] - b[this.x_key]) + (a[this.y_key] - b[this.y_key])*(a[this.y_key] - b[this.y_key]);
        }
    }
    
    ObjectQueue.prototype.abs = function(x) {
        if( x < 0 ){return -x;}
        return x;
    }


    //
    // Sort Handler
    // キュー要素をソートするためのメソッド群
    //
    //
    ObjectQueue.prototype.sort_algorithm = function(_sort_type) {
        if(       _sort_type == 0 || _sort_type == "auto" ){
            this.sort_type = 0;
        }else if( _sort_type == 1 || _sort_type == "bubble" ){
            this.sort_type = 1;
        }else if( _sort_type == 2 || _sort_type == "quick" ){
            this.sort_type = 2;
        }else{
            this.sort_type = 0;
        }
    }
    
	
    // ソート関数（sortkeyで指定されたプロパティの値に従い、キュー要素をcomparativeで指定した方向でソート）
    ObjectQueue.prototype.sort = function(sortkey,comparative) {
        //省略引数初期値
        if( comparative == null ){
            comparative = this.INC_SORT;
        }
        
        //主処理
        if(this._qlen < 2){
            return;
        }
        
        if(this.sort_type == 0){
            //var n = this._qlen;
            //if( n*n > n*Math.log(n) ){ //The result of the function is always true
            if( 1 ){
                //console.log("Quick!:",n*n, n*Math.log(n));
                this._quick_sort(sortkey,comparative);
            }else{
                //console.log("Bubble!:",n*n, n*Math.log(n));
                this._bubble_sort(sortkey,comparative);
            }
        }else if(this.sort_type == 1){
            this._bubble_sort(sortkey,comparative);
        }else{
            this._quick_sort(sortkey,comparative);
        }
    }
    
    // ソート内部処理（バブルソート関数）(n^2)
    ObjectQueue.prototype._bubble_sort = function(sortkey,comparative) {
        for (var i = 1; i <= this._qlen - 1; i++){
            for (var j = 0; j < this._qlen - i; j++){
                var mc = this.refer(j);
                if(mc && mc.q_next[this._qid]){
                    if ( (mc[sortkey] > mc.q_next[this._qid][sortkey]) == comparative){
                        this.transpose_next(mc);
                    }
                }
            }
        }
    }
    
    // 要素mcを次の要素と入れ替える
    ObjectQueue.prototype.transpose_next = function(mc) {
        if(this._qlen < 2){
            return;
        }
        
        if(mc == this._qhead){
            this._qhead = mc.q_next[this._qid];
        }else{
            mc.q_previous[this._qid].q_next[this._qid] = mc.q_next[this._qid];
        }
        if(mc.q_next[this._qid] == this._qtail){
            this._qtail = mc;
        }else{
            mc.q_next[this._qid].q_next[this._qid].q_previous[this._qid] = mc;
        }
        
        mc.q_next[this._qid].q_previous[this._qid] = mc.q_previous[this._qid] ;
        mc.q_previous[this._qid]      = mc.q_next[this._qid];
        
        var temp = mc.q_next[this._qid].q_next[this._qid];
        mc.q_next[this._qid].q_next[this._qid]     = mc;
        mc.q_next[this._qid]          = temp;
    }
    
    
    // ソート内部処理（Quickソート関数）(n*log(n))
    ObjectQueue.prototype._quick_sort = function(sortkey, comparative) {
        this._quick_sort_core(sortkey, comparative, this._qhead, this._qtail);
    }
    
    ObjectQueue.prototype._quick_sort_core = function(sortkey, comparative, startMC, endMC) {
        //範囲の間にある値をピポットに設定する
        var pivot = startMC;
        var mc = this.next(startMC);
        if( mc ){
            pivot = mc;
        }

        //引数を左端、右端として変数にいれる
        var left = startMC;
        var right = endMC;
        
        //ピポットより小さい値を左側へ、大きい値を右側へ分割する
        while(true){
            var hit=0;
            //leftの値がpivotより小さければleftを一つ右へ移動する
            while((left[sortkey]<pivot[sortkey])==comparative && left[sortkey]!=pivot[sortkey]){
                if(left==right){ hit=1; break; }
                if( this.next(left) ){
                    left = this.next(left);
                }else{
                    hit=1;
                    break;
                }
            }

            //rightの値がpivotより大きければrightを一つ左へ移動する
            while((pivot[sortkey]<right[sortkey])==comparative && pivot[sortkey]!=right[sortkey]){
                if(left==right){ hit=1; break; }
                if( this.previous(right) ){
                    right = this.previous(right);
                }else{
                    hit=1;
                    break;
                }
            }
            while(this.next(left) && this.next(left)[sortkey]==left[sortkey] && left!=right){
                left = this.next(left);
                if(left==right){ hit=1; break; }
            }
            while(this.previous(right) && this.previous(right)[sortkey]==right[sortkey] && left!=right){
                right = this.previous(right);
                if(left==right){ hit=1; break; }
            }
            //if(left==startMC && right==endMC){ break; }

            //leftとrightの値がぶつかったら、そこでグループ分けの処理を止める。
            if( left==right || hit ){
                break;
            }
            
            //rightとrightの値がぶつかっていない場合、leftとrightを交換
            //交換後にleftを後ろへ、rightを前へ一つ移動する
            var _l = this.next(left);
            var _r = this.previous(right);

            if(left  == startMC){ startMC = right; }
            if(right == endMC)  { endMC   = left; }

            if( _l == null ){ _l = startMC; }
            if( _r == null ){ _r = endMC; }

            this.swap(left, right);

            left  = _l;
            right = _r;
            if(left==right){ break; }
        }

        // Debug
        /*
        var str= pivot[sortkey]+": ";
        var i=0;
        for (mc=this._qhead ; mc ; mc=mc.q_next[this._qid]){
            str += mc.data+", ";
            mc.index = (i++);
        }
        console.log(str+"(pivot="+pivot[sortkey]+
                    ",start="+startMC[sortkey]+
                    ",endMC="+endMC[sortkey]+
                    ",[left="+left[sortkey]+",right="+right[sortkey]+ ","+left.index+","+right.index+
                    "])\n");
        */
        
        var lmc;
        var rmc;
        lmc = null;
        rmc = null;
        if(left!=startMC){
            if(left!=endMC){
                lmc=left;
            }else if(this.previous(left) && this.previous(left)!=startMC){
                lmc=this.previous(left);
            }
        }
        if(right!=endMC){
            rmc=right;
        }

        //左側に分割できるデータがある場合、quickSort関数を呼び出して再帰的に処理を繰り返す。
        if(lmc){
            this._quick_sort_core(sortkey, comparative, startMC, lmc);
        }

        //右側に分割できるデータがある場合、quickSort関数を呼び出して再帰的に処理を繰り返す。
        if(rmc){
            this._quick_sort_core(sortkey, comparative, rmc, endMC);
        }
    }

    // 要素mc1を要素mc2と入れ替える
    ObjectQueue.prototype.swap = function(mc1, mc2) {
        if(this._qlen < 2){
            return;
        }

        if(mc1 == this._qhead){
            this._qhead = mc2;
        }else if(mc2 == this._qhead){
            this._qhead = mc1;
        }

        if(mc1 == this._qtail){
            this._qtail = mc2;
        }else if(mc2 == this._qtail){
            this._qtail = mc1;
        }

        if(mc1.q_next[this._qid]){
            if(mc1.q_next[this._qid] != mc2){
                mc1.q_next[this._qid].q_previous[this._qid] = mc2;
            }else{
                //mc1.q_next[this._qid].q_previous[this._qid] = mc1.q_previous[this._qid];
            }
        }
        if(mc1.q_previous[this._qid]){
            if(mc1.q_previous[this._qid] != mc2){
                mc1.q_previous[this._qid].q_next[this._qid] = mc2;
            }else{
                //mc1.q_previous[this._qid].q_next[this._qid] = mc1.q_next[this._qid];
            }
        }
        if(mc2.q_next[this._qid]){
            if(mc2.q_next[this._qid] != mc1){
                mc2.q_next[this._qid].q_previous[this._qid] = mc1;
            }else{
                //mc2.q_next[this._qid].q_previous[this._qid] = mc2.q_previous[this._qid];
            }
        }
        if(mc2.q_previous[this._qid]){
            if(mc2.q_previous[this._qid] != mc1){
                mc2.q_previous[this._qid].q_next[this._qid] = mc1;
            }else{
                //mc2.q_previous[this._qid].q_next[this._qid] = mc2.q_next[this._qid];
            }
        }
        
        var temp = mc2.q_next[this._qid];
        if( mc1.q_next[this._qid] == mc2 ){
            mc2.q_next[this._qid] = mc1;
        }else{
            mc2.q_next[this._qid] = mc1.q_next[this._qid];
        }
        if( temp == mc1 ){
            mc1.q_next[this._qid] = mc2;
        }else{
            mc1.q_next[this._qid] = temp;
        }

        temp = mc2.q_previous[this._qid];
        if( mc1.q_previous[this._qid] == mc2 ){
            mc2.q_previous[this._qid] = mc1;
        }else{
            mc2.q_previous[this._qid] = mc1.q_previous[this._qid];
        }
        if( temp == mc1 ){
            mc1.q_previous[this._qid] = mc2;
        }else{
            mc1.q_previous[this._qid] = temp;
        }
    }
    
    
}(window));
