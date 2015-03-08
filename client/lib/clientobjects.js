closeTimeout = "";//the handle to the timeout which closes appointmentEdit after 3 seconds.
//declared here for globallity.
rerenderDep = new Deps.Dependency();
getRowHeight = function() {
	var ret = parseInt($(".timeRow").css("height"));
	if (ret === 38) {//OH GOD DIRTY HACK
	//Firefox overreports the height of rows by 1px. Wat?
		return ret-1;
	}
	else {
		return ret;
	}
}
getDate = function (){
	return Session.get("date");
}
dayDelta = function (date) {
	var diff = moment(date).diff(moment().startOf('day'), "days");
	if (diff===1){
		return " tomorrow";
	}
	else if (diff===-1) {
		return " yesterday";
	}
	else if (diff === 0)
	{
		return " today"
	}
	else if (diff > 1)
	{
		return " in " +Math.abs(diff)+ " days"
	}
	else
	{
		return " "+Math.abs(diff)+" days ago"
	}
};
