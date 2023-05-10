function toTop(){
    $("html").scrollTop(0,0);
}

function scroll2(obj){
        var id = obj.name;
        id = "#"+id
        h = $(id).offset().top;
        $("html").scrollTop(h-60)

    }



$(window).ready(function(){
    
        if($(document).width()>1000 || $(window).width()>1000){
            
            var navh = $("#nav").height();
            var h = $(window).height()
    
            $("#article_sidenav").height(h-navh-10)
            // $("#article_sidenav").addClass("article-sidenav").slideDown();

        }else{
            $("#article_sidenav").height("auto")
            // $("#article_sidenav").removeClass("article-sidenav")

        }
    
})

$(window).resize(function(){
    if($(document).width()>1000 || $(window).width()>1000){
        var navh = $("#nav").height();
        var h = $(window).height()

        $("#article_sidenav").height(h-navh-10)
        // $("#article_sidenav").addClass("article-sidenav").slideDown();


    }else{
        $("#article_sidenav").height("auto")
        // $("#article_sidenav").removeClass("article-sidenav")


    }
})





// $(window).ready(function(){
//     if($(document).width()>767 || $(window).width>767){
// var navh = $("#nav").height();

// var h = $(window).height()

// $("#article_sidenav").height(h-navh-2)
// $("#article_sidenav").addClass("article-sidenav")

// $(window).resize(function(){
//     var h2 = $(window).height()
//     if($(document).width()>767 || $(window).width>767){


//     $("#article_sidenav").height(h2-navh-2)

//     }else{


// $("#article_sidenav").height("auto")
// $("#article_sidenav").removeClass("article-sidenav")

// // $("#article_body").height("auto")
//     }  
// })
// }else{
// $(window).resize(function(){
//     if($(document).width()>767 || $(window).width()>767){
//         var h2 = $(window).height()
//         var navh = $("#nav").height();
//     $("#article_sidenav").height(h2-navh-2)
//     $("#article_sidenav").addClass("article-sidenav")


//     }else{
// $("#article_sidenav").height("auto")
// $("#article_sidenav").removeClass("article-sidenav")

//     }   
// })
// }


// });
$(document).ready(function(){
  
    $(".qdz").on('shown.bs.dropdown', function(){
      $("#dpzhezhao").css("display","block")
    })
    $(".qdz").on('hidden.bs.dropdown', function(){
      $("#dpzhezhao").css("display","none")
    }) 
  
})


$(function () {
    $('[data-toggle="popover"]').popover()
  });
  
          $(document).ready(function(){
      
      $('.article-tbody').find('li').each(function(){
          
          var a = $(this).find('a:first')[0];
          if($(a).attr('href')===location.pathname){
              
              $(this).addClass('asclass');
          }else{
              $(this).removeClass('asclass');
          }
      });
  });
  
  $(document).ready(function(){
      
      $('.article-tbody').find('th').each(function(){
          
          var a = $(this).find('a:first')[0];
          if($(a).attr('href')===location.pathname){
              
              $(this).addClass('asclass');
          }else{
              $(this).removeClass('asclass');
          }
      });
  });
  
  $(document).ready(function(){
      $(".btclick").click(function(){
          var a = $(this).children("span")
          var b= a.attr("class")
          if(b.search("glyphicon-menu-down")!=-1){
              a.removeClass("glyphicon-menu-down")
              a.addClass("glyphicon-menu-right")
  
          }else{
              a.removeClass("glyphicon-menu-right")
              a.addClass("glyphicon-menu-down")
              
          }
          
      })
  
  });



