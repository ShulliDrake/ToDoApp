//namespace NozomiLipps(NL)
if(!NL || typeof NL === undefined) {
    var NL = {};
}

$(function(e){
    //document ready

    var projectView = new NL.views.ProjectView({
	el: $("#projects"),
	model: new NL.models.ProjectModel
    });

});

//Backbone models and views
NL.models = {};
NL.views = {};

NL.models.ProjectModel = Backbone.Model.extend({
    defaults: {
	//default - each column has 4 projects
	todo: 4,
	inprogress: 4,
	done: 4,
	total: 12,
	newProject: null  //newly added project name
    },

    incrementCount: function(columnName) {
	this.set(columnName, this.get(columnName) + 1)
    },

    decrementCount: function(columnName) {
	this.set(columnName, this.get(columnName) - 1);
    },

    addProject: function(newProject) {
	//new project is added to "ToDo" column
	this.set("newProject", newProject);
	this.set("todo", this.get("todo") + 1);
	this.set("total", this.get("total") + 1);
	this.trigger("ProjectAdded");
    }

});

NL.views.ProjectView = Backbone.View.extend({

    initialize: function() {

	var addButtonView = new NL.views.AddButtonView({
	    el: $("#add_project"),
	    model: this.model
	});

	var totalCounterView = new NL.views.TotalCounterView({
	    el: $("#total_count"),
	    model: this.model
	});

	var todoColumnView = new NL.views.ToDoView({
	    className: "todo",
	    el: $(".todo"),
	    model: this.model
	});

	var inProgressColumnView = new NL.views.InProgressView({
	    className: "inprogress",
	    el: $('.inprogress'),
	    model: this.model
	});

	var doneColumnView = new NL.views.DoneView({
	    className: "done",
	    el: $('.done'),
	    model: this.model
	});

    }
});

/*
 * ToDo, InProgress, and Done views extend this ColumnView.
 */
NL.views.ColumnView = Backbone.View.extend({

    events: {
	"sortreceive": "addCount",
	"sortremove": "minusCount"
    },

    initialize: function() {
	//jquery ui sortable
	this.$("ul").sortable({
	    connectWith: ".sortable",
	    dropOnEmpty: true
	}).disableSelection();

    },

    updateCounter: function() {
	this.$('.count_box span').text(this.model.get(this.className));
    },

    addCount: function() {
	this.model.incrementCount(this.className);
    },

    minusCount: function() {
	this.model.decrementCount(this.className);
    }

});

NL.views.ToDoView = NL.views.ColumnView.extend({

    template: _.template("<li><%=newProject%></li>"),

    initialize: function() {
	//jquery ui sortable --- "ToDo" items can only be dropped into "InProgress" column.
	this.$("ul").sortable({
	    connectWith: "#in_progress",
	    dropOnEmpty: true
	}).disableSelection();

	this.model.bind("ProjectAdded", this.addProject, this);
	//update project counts on model change
	this.model.bind("change:todo", this.updateCounter, this);
    },

    addProject: function() {
	//new project is added to ToDo column
	var newProject = this.model.get("newProject");
	this.$("ul").append(this.template({"newProject":newProject}));
    }

});

NL.views.InProgressView = NL.views.ColumnView.extend({

    initialize: function() {
	//jquery ui sortable --- "InProgress" items can be dropped into "ToDo" and "Done".
	this.$("ul").sortable({
	    connectWith: "#todo, #done",
	    dropOnEmpty: true
	}).disableSelection();

	//update project counts on model change
	this.model.bind("change:inprogress", this.updateCounter, this);
    }

});

NL.views.DoneView = NL.views.ColumnView.extend({

    initialize: function() {
	//jquery ui sortable --- "Done" items can be dropped into "ToDo" and "InProgress".
	this.$("ul").sortable({
	    connectWith: "#todo, #in_progress",
	    dropOnEmpty: true
	}).disableSelection();

	//update project counts on model change
	this.model.bind("change:done", this.updateCounter, this);
    }

});

NL.views.AddButtonView = Backbone.View.extend({
    //underscore template for "add project" dialog.
    template: _.template('<div id="add_dialog" title="Add a project">' +
			 '<p>Please enter a project to add to "To Do" list.</p>' +
			 '<label for="project_name">Project Name:</label>' +
			 '<input type="text" name="project_name" id="project_name" class="text ui-widget-content ui-corner-all" />' +
			 '<p id="error_msg"></p>' +
			 '</div>'),

    dialogSelector: "#add_dialog",

    events: {
	"click button": "showDialog"
    },

    initialize: function() {
	var self = this;
	//initialize jquery ui dialog box
	$(this.template()).dialog({
	    autoOpen: false,
	    height: 200,
	    width: 300,
	    modal: true,
	    buttons: {
		"Add": function() {
		    var newProject = $("#project_name").val();
		    //escape user entered string
		    newProject = $('<div/>').text(newProject).html();

		    if (newProject) {
			self.model.addProject(newProject);
			$( this ).dialog("close");
		    } else {
			$("#project_name").addClass("ui-state-error");
			$("#error_msg").text("Please enter a project.");
			return false;
		    }
		},
		Cancel: function() {
		    $( this ).dialog("close");
		}
	    },

	    close: function() {
		//clear input box
		$(".text", this).val("").removeClass("ui-state-error");
		//clear error message
		$("#error_msg", this).text("");
	    }
	});
    },

    showDialog: function() {
	$(this.dialogSelector).dialog("open");
    }

});

NL.views.TotalCounterView = Backbone.View.extend({

    initialize: function() {
	//update total counter when total count is changed.
	this.model.bind("change:total", this.updateCounter, this);
    },

    updateCounter: function() {
	this.$(".count_box span").text(this.model.get("total"));
    }

});
