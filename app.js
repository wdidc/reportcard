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
	totalCount++;
	var assignment = response[i];
	if( assignment.status === "complete" ){
	  completeCount++;
	} else {
	  incompleteCount++;
	  var incompleteAssignment = $( "<li></li>" ).html( assignment.assignment_title );
	  $( "#list-incomplete" ).append( incompleteAssignment );
	}
      }
      percentComplete = ( completeCount / totalCount ) * 100;
      $( "#percent-complete" ).html( percentComplete + "%" );
      percentIncomplete = ( incompleteCount / totalCount ) * 100;
      $( "#percent-incomplete" ).html( percentIncomplete + "%" );
    });
  } else {
    $(".js-login").html("Log In with GitHub")
    $(".showIfCurrentUser").hide()
  }
}
init()
