# ObjectQueue
ObjectQueue is a multi-function queue; by using this queue, javascript objects can be enqueued, dequeued, sorted, searched, summed or etc.

## API ##

### ObjectQueue( [_qoption] ) ###
-constructor: create an ObjectQueue.
--you can use null as _qoption ObjectQueue._QOPT_DEQ_CLEAN. 
- Note: _qoption may be modified.

-_qoption:
_qoption.deq_clean: if set 1, the hidden object which automatically created in the queue element during the enqueuing process is removed when the queue element is dequeued (default 1).
-Note: _QOPT_NONE option has been removed.


### .get_version() ####
get ObjectQueue version.


### .enqueue(object, [mask]) ####
-enqueue target object into queue top as a queue elemnt.
-you can omit mask.

### .dequeue(key, val) ####
-dequeue the tail of queue element as an javascript object.
-you can omit mask.
-you can dequeue specific queue element which is a first element of satisfying qe["key"]==val.


### .removeall([mask]) ####
-remove all queue elements from ObjectQueue.
-you can omit mask.


### .deleteall([mask]) ####
-remove and delete all queue elements from ObjectQueue.
-you can omit mask.


### .mask( qe ) ####
-the qe(queue element) state is changed to Masked.
-Note: API name has been changed.

### .unmask( qe ) ####
-the qe(queue element) state is changed to UnMasked.
-Note: API name has been changed.


### .setmask( key, val ) ####
-the state of qe(queue element)s, which satisfied qe["key"]==val), are changed to Masked.

### .resetmask( key, val ) ####
-the state of qe(queue element)s, which satisfied qe["key"]==val), are changed to UnMasked .


### .setmaskall() ####
-the state of all qe(queue element)s are changed to Masked.

### .resetmaskall() ####
-the state of all qe(queue element)s are changed to UnMasked.


### .get_current_mask() ####
-get the current applying mask set name.

### .new_mask(_new_mask_set_name, _initial_mask_state) ####
-create a new mask set named by _new_mask_set_name.
-initial mask state (Masked or UnMasked) is specified by _initial_mask_state.

### .set_mask(_mask_set_name) ####
-applying mask set ,specified by _mask_set_name, as a current mask set.

### .save_mask(_mask_set_name) ####
- save mask state of all queue elements to the mask set specified _mask_set_name.

### .save_mask(_mask_set_name) ####
- load mask state of all queue elements from the mask set specified _mask_set_name.

### .change_mask(_mask_set_name) ####
- change mask set by saving current mask set and loading mask set specified _mask_set_name.



### .head([mask]) ####
- get a queue element from the queue head.

### .tail([mask]) ####
- get a queue element from the queue tail.

### .next(qe, [mask]) ####
- get a queue element next to the qe.

### .previous(qe, [mask]) ####
- get a queue element previous to the qe.

### .refer(num) ####
- get a num(th) queue element from the queue top.

### .length([mask]) ####
- get a total number of queue element(s) in this ObjectQueue.


### .count(key,val,[mask]) ####
- get a total number of queue element(s) which satisfied qe["key"]==val.

### .search(key,val,[mask], [start_qe]) ####
- get a queue element(s) which satisfied qe["key"]==val.
- you can omit start_qe and search qe from queue head.
- Note: this API,mask and start_qe, may be modified.

### .search_index(key,val,[mask], [_start]) ####
- get a queue element(s) index number which satisfied qe["key"]==val.
- you can omit the index number of '_start' and search qe index number from queue head.


### .min(key,[mask]) ####
- get a queue element(s) which has minimum number of qe["key"].

### .max(key,[mask]) ####
- get a queue element(s) which has maximum number of qe["key"].


### .set_position_search_key(x,y) ####
- Note: in progress
### .position_search(qe, comparative, [mask], [manhattan]) ####
- Note: in progress
### .position_range_search_count(qe, manhmin, manhmax, [mask], [manhattan] ) ####
- Note: in progress
### .mlength(a, b, [manhattan] ) ####
- get manhattan length between qe_a and qe_b which has x and y parameter.

### .sort_algorithm( _type ) ####
- set sorting algorithm.
- auto: auto select
- bubble: bubble sort
- quick: quick sort

### .sort( _sort_key, [comparative] ) ####
- sort queue element using '_sort_key'.

### .transpose_next( _qe ) ####
- Note: in progress

### .swap( _qe1, _qe2 ) ####
- swap enqueued queue elements specified by _qe1 and _qe2.

