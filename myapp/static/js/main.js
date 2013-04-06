//namespace
if(!NL || typeof NL === undefined) {
    var NL = {};
}

$(function(e){
    //document ready

    //jquery ui sortable
    $( "#todo, #in_progress, #done" ).sortable({
	connectWith: ".sortable"
    }).disableSelection();
});