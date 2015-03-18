﻿/** 
 * @file: paginator plugin
 * @version 2.0
 * @author: xucaiyu
 * @email: 569455187@qq.com
 */
// paginator plugin
!(function(window){
		var Default = {
			current: 0, 		// 当前页
			total: 0, 			// 总页数
			count: 0, 			// 总条数
			startPage: 2, 		// 开始显示条数 head page
			endPage: 1,   		// 结束显示条数 end page
			numPage: 5,   		// 最多显示条数 show total page
			prev: '‹',			// 上一页文本
			next: '›',			// 下一页文本
			first: 'First',		// 第一页文本
			last: 'Last',		// 最后一页文本
			numShow: true,		// 是否显示页码部分
			totalShow: true,	// 是否显示页数 show total
			countShow: false,	// 是否显示条数
			arrowShow: true, 	// 是否一直显示上或下一个按钮
			fastShow: true, 	// 是否一直显示第一或最后按钮
			skipShow: false,	// 是否显示跳转
			selector: '',		// 容器 container
			autoInit: false,	// 是否自动初始化
			autoLink: false,	// auto reload page
			linkTo: function( page ){	// paginator
				return '#';
			},
			bindFun: function(){}
		}
		// paginatoion
		function pagination( options ){
			var that = this;

			that.options = $.extend({}, Default, options || {});

			that.$selector = typeof options.selector === 'string' ? $( options.selector ) : options.selector;

			// 自动初始化
			// if( that.autoInit )
			that._init();
		}
		
		pagination.prototype = {
			version: '2.0',
			_init: function(){
				var that = this,
					options = that.options,
					autoLink = options.autoLink,
					skipShow = options.skipShow,
					total = Number( options.total ),
					current = Number( options.current ),
					count = Number( options.count ),
					html;

				html = '<div class="xcy-pages-warp">';
				html += '<div class="xcy-pages-num">';
				html += that._drawLink( current, total );
				html += '</div>';
				html += that._drawCount( current, total, count );
				if( skipShow ){
					html += that._drawSkip( current );
				}
				html += '</div>';

				// render dom html
				that.$selector.html( html );
				// paginator event
				if( !autoLink ){
					// ajax
					// 异步加载
					$( '.xcy-pages-warp', that.$selector ).delegate( 'a', 'click', function( e ){
						var className = $( this ).attr( 'class' );

						if( className == 'xcy-next' ){
							current++;
						}else if( className == 'xcy-prev' ){
							current--;
						}else if( className == 'xcy-first' ){
							current = 1;
						}else if( className == 'xcy-last' ){
							current = options.total;
						}else{
							current = Number( $( this ).attr( 'sh-page' ) );
						}

						if( current > options.total ) return;
						// refresh and bind event
						that.refresh({ current: current })

						e.preventDefault();
					})
					// skip form submit
					// submit button 异步加载
					if( skipShow ){
						$( '.xcy-pages-form', that.$selector ).bind( 'submit', function(){
							current = $( '.xcy-skip-input', that.$selector ).val();

							if( current > options.total ) return false;

							that.refresh({ current: current })

							return false;
						})
					}
				}else{
					// form submit
					// submit button 同步加载
					$( '.xcy-pages-form', that.$selector ).bind( 'submit', function(){
						var bo;

						current = $( '.xcy-skip-input', that.$selector ).val();

						if( current > total ) return false;
						// return submit boolen
						bo = options.bindFun( current );

						$( this ).attr( 'action', options.linkTo( current ) );

						return bo ? true : bo;
					})
				}
				
			},
			_drawLink: function( current, total ){
				var that = this,
					options= that.options,
					startPage = Number( options.startPage ),
					endPage = Number( options.endPage ),
					NewEndPage =  endPage > 0 ? endPage - 1 : -1,
					numPage = Number( options.numPage ),
					minNumPage = numPage - 1,
					startNumPage = parseInt( ( numPage - 1 )/2 ),
					endNumPage = numPage - startNumPage - 1,
					html = '',
					split = '<span class="xcy-pages-split">...</span>';  

				// first
				if( current > 1 && options.fastShow ){
					html += '<a href="javascript:;" class="xcy-first">'+ options.first +'</a>';
				}else if( options.fastShow !== false ){
					html += '<span class="xcy-first">'+ options.first +'</span>';
				}

				// prev
				if( current > 1 && options.arrowShow ){
					html += '<a href="javascript:;" class="xcy-prev">'+ options.prev +'</a>';
				}else if( options.arrowShow !== false ){
					html += '<span class="xcy-prev">'+ options.prev +'</span>';
				}

				if( options.numShow ){
					if( current - numPage >= 0 && total - current >= minNumPage ){
						// current is middle
						// start
						if( current - 1 > startPage + startNumPage ){
							html += that._eachBlock( 1, startPage );
							html += split;
						}else{
							html += that._eachBlock( 1, startPage );
						}

						// middle
						html += that._eachBlock( current - startNumPage, current + endNumPage );

						// end
						if( total - current > endPage + endNumPage ){
							html += split;
							html += that._eachBlock( total - NewEndPage, total );
						}else{
							html += that._eachBlock( current + endNumPage + 1, total );
						}	

					}else if( current - numPage < 0 && total > numPage + endPage ){
						// current is start
						// start
						html += that._eachBlock( 1, numPage );
						html += split;
						// end
						html += that._eachBlock( total - NewEndPage, total );

					}else if( total - current < minNumPage && total > numPage + startPage ){
						// current is end
						// start
						html += that._eachBlock( 1, startPage );
						html += split;
						// end
						html += that._eachBlock( total - minNumPage, total );

					}else{
						// current is all
						html += that._eachBlock( 1, total );
					}
				}

				// next
				if( current < total  && options.arrowShow ){
					html += '<a href="javascript:;" class="xcy-next">'+ options.next +'</a>';
				}else if( options.arrowShow !== false ){
					html += '<span class="xcy-next">'+ options.next +'</span>';
				}

				// last
				if( current < total && options.fastShow ){
					html += '<a href="javascript:;" class="xcy-last">'+ options.last +'</a>';
				}else if( options.fastShow !== false ){
					html += '<span class="xcy-last">'+ options.last +'</span>';
				}

				return html;
			},
			_drawCount: function( current, total, count ){
				var html = '';

				html += '<div class="xcy-pages-count">';
				// total
				if( this.options.totalShow )
					html += '<b>'+ current +'/' + total + '</b><span>页</span>';
				// count
				if( this.options.countShow )
					html += ' <span>共</span>'+ count +'条';

				html += '</div>';

				return html;
			},
			_drawSkip: function( current, total ){
				var that = this,
					options= that.options,
					skipShow = options.skipShow,
					current = current + 1 > total ? current : current + 1,
					html = '';

				// skip
				html += '<div class="xcy-pages-skip"><form id="xcy-pages-form" class="xcy-pages-form" action="">';
				html += '<label>去第</label><input type="text" class="xcy-skip-input" name="xcy-page" size="3" value=\"'+ current +'\"><span>页</span>';
				html += '<input type="submit" class="xcy-skip-button" value="确 定"><form></div>';

				return html;
			},
			_eachBlock: function( min, max ){
				var that = this,
					linkTo = that.options.linkTo,
					current = that.options.current,
					i, html = '';

				for ( i = min; i <= max; i++ ) {
					if( i == current ){
						html += '<span class="xcy-pages-current">'+ i +'</span>';
					}else{
						html += '<a href="'+ linkTo(i) +'" sh-page="'+ i +'" >'+ i +'</a>';
					}
				};

				return html;
			},
			refresh: function( options ){
				var that = this,
					skipShow = that.options.skipShow,
					current, subCurrent, total, count;

				$.extend( that.options, options || {});

				current = Number( that.options.current );
				total = Number( that.options.total );
				count = Number( that.options.count );

				$( '.xcy-pages-num', that.$selector ).html( that._drawLink( current, total ) );

				$( '.xcy-pages-count', that.$selector ).replaceWith( that._drawCount( current, total, count ) );

				if( skipShow ){
					subCurrent = current + 1 > total ? current : current + 1,
					$( ' .xcy-skip-input', that.$selector ).val( subCurrent );
				}
				// page bind event
				that.options.bindFun.call(this, current );

				return this;
			},
			destroy: function(){
				var that = this;

				$( '.xcy-pages-warp', that.$selector ).unbind();
				if( that.options.autoLink || that.options.skipShow ){
					$( '.xcy-pages-form', that.$selector ).unbind();
				}
			}
		}

		typeof define == "function" ? define(function(fasTpl) {
	        return pagination;
	    }) : typeof exports != "undefined" ? module.exports = pagination : window.Paginator = pagination;
})(window)