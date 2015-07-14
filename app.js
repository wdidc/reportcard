var accessToken, currentUser;
$( ".js-login" ).on( "click", function( e ){
  e.preventDefault();
  if(currentUser){
    localStorage.setItem("currentUser",null)
    init()
  } else {
    window.open( "http://auth.wdidc.org" );
  }
})
window.addEventListener( "message", function( e ){
  e.preventDefault();
  accessToken = e.data;
  getUser( accessToken );
})

function getUser( token ){
  $.getJSON( "https://api.github.com/user?access_token=" + token, function( response ){
    response.access_token = token;
    localStorage.setItem( "currentUser", JSON.stringify(response) );
    init()
  })
}

function init(){
  currentUser = JSON.parse( localStorage.getItem( "currentUser" ) ) ;
  console.log( currentUser );
  if (currentUser) {
    // Attendance
    $(".js-login").html("logout "+ currentUser.login)
    $(".showIfCurrentUser").show()
    var urlAttendance = "http://api.wdidc.org/attendance/students/" + currentUser.id + "?callback=?";
    $.getJSON( urlAttendance, function( response ){
      var tardyCount = 0,
	  absentCount = 0;
      for( var i=0; i < response.length; i++ ){
      	switch( response[i].status ){
      	    case "tardy":
      	      tardyCount++;
      	      break;
      	    case "absent":
      	      absentCount++;
      	      break;
      	    default:
      	      console.log( "No attendance status logged" );
      	      break;
      	}
      }
      $( "#num-tardy" ).html( tardyCount );
      $( "#num-absent" ).html( absentCount );
      if( tardyCount + (absentCount * 2) >= 8 ){
        $( ".attendance-graph" ).addClass( "red" );
      }
    }).fail(function( error ){
      console.log( "Attendance JSON call failed" );
    });

    // Homework
    var urlAssignments = "http://api.wdidc.org/assignments/students/" + currentUser.id;

    $.getJSON( urlAssignments, function( response ){
      var totalCount = 0,
	  completeCount = 0,
	  incompleteCount = 0;
      // Loops through each assignment
      for( var i=0; i < response.length; i++ ){
	var assignment = response[i];
	if(assignment.assignment_type == "homework"){
	  totalCount++;
	  if( assignment.status === "complete"){
	    completeCount++;
	  } else {
	    incompleteCount++;
	    var incompleteAssignment = $( "<li></li>" ).html( "<a href='"+assignment.assignment_repo_url+"'>"+assignment.assignment_title+"</a>" );
	    $( "#list-incomplete" ).append( incompleteAssignment );
	  }
	}//if homework
	if(assignment.assignment_type == "project"){
	  var project = $("<div class='js-project'></div>")
          project.append("<h3>"+assignment.assignment_title+"</h3>")
          if(assignment.status){
	    project.append("<div>"+assignment.status+"</div>")
	    $(".js-projects").append(project)
	  }
	  }
	}
      percentComplete = parseFloat(( completeCount / totalCount ) * 100).toFixed(2);
      if( percentComplete < 80 ){
        $( ".percent-complete" ).css( "background-color", "#ff3f2c" );
      }
      else{
        $( ".percent-complete" ).css( "background-color", "#1fce35" );
      }
      $( ".percent-complete" ).css( "width", percentComplete + "%" );
      $( ".percent-complete" ).html( percentComplete + "% complete" );
      percentIncomplete = parseFloat( (incompleteCount / totalCount ) * 100).toFixed(2);
      $( "#percent-incomplete" ).html( percentIncomplete + "%" );
    });
  } else {
    $(".js-login").html("Log In with GitHub")
    $(".showIfCurrentUser").hide()
  }
}
init()

function test(id){
  var u = JSON.parse(localStorage.getItem("currentUser"))
  u.id = id
  localStorage.setItem("currentUser", JSON.stringify(u))
  init()
}
