window.onload = function() {
  var parser = document.createElement('script');
  parser.text = `
  messages = [];
  message = "";
  error_nodes = "";
  warning_nodes = "";
  function scrap(){
    servers = $('.list-group .list-group-item');

    // Load on DB 1. should be less than 10
    db_1_data = servers.slice(0,1).find('.list-group-item-text').find('.row');
    name = $(db_1_data[0]).children(":eq(0)").text().trim().split('-')[1].split('.')[0];
    stats = $(db_1_data[1]);
    load_elem = $(stats.children(":eq(1)"));
    load = parseFloat(load_elem.children(":eq(1)").text());
    load_class = load_elem.attr("class").split(" ")[1];
    if(load > 10.0){
      message = "DB1 load => "
      message += load + "  "
      messages.push(message)
      createNode("DB1 load", "", load, "", "", "text-danger", "")
    }

    // all servers
    $.each(servers, function(_i, server){
      server_data = $(server).find('.list-group-item-text').find('.row')
      var name = $(server_data[0]).children(":eq(0)").text().trim().split('-')[1].split('.')[0];
      var stats = $(server_data[1]);

      var lag_elem = $(stats.children(":eq(0)"));
      var load_elem = $(stats.children(":eq(1)"));
      var mem_elem = $(stats.children(":eq(3)"));

      var lag = parseFloat(lag_elem.clone().children().remove().end().text());
      var load = parseFloat(load_elem.children(":eq(1)").text());
      var mem_per = mem_elem.children(":eq(1)").text();

      var lag_class = lag_elem.attr("class").split(" ")[1] || "";
      var load_class = load_elem.attr("class").split(" ")[1] || "";
      var mem_class = mem_elem.attr("class").split(" ")[1] || "";

      // DB servers RAM usage is normally high so ignoring it
      if(name.match(/db|ftp|sms|fields|tables|clicks|sends|contacts|opens|cloud2/i)){
        mem_class = ""
      }

      // Injections and Mailers load is usually OK, upto 25-50
      if(name.match(/injection|mailer/i)){
        load_class = ""
      }
      if(load_class == "text-danger" || mem_class == "text-warning" || mem_class == "text-danger"){
        message = name + " => "
        message += load + "  "
        message += mem_per + "  "
        messages.push(message)
        createNode(name, "", load, mem_per, "", load_class, mem_class)
      }
      if(lag > 100.0){
        message = name + " lag => "
        message += lag + "  "
        messages.push(message)
        createNode(name, lag, "", "", "text-danger", "", "")
      }
    })
    
    return [error_nodes,warning_nodes,messages];
  }
  function createNode(name, lag, load, memory, lag_class, load_class, mem_class){
    str = "<tr>"
    str += "<td>"+name+"</td>"
    if(lag_class){
      str += '<td class="'+lag_class+'">'+lag+"</td>"
    } else {
      str += "<td>"+lag+"</td>"
    }

    if(load_class){
      str += '<td class="'+load_class+'">'+load+"</td>"
    } else {
      str += "<td>"+load+"</td>"
    }

    if(mem_class){
      str += '<td class="'+mem_class+'">'+memory+"</td>"
    } else {
      str += "<td>"+memory+"</td>"
    }
    str += "</tr>"
    if(lag_class == "text-danger" || load_class == "text-danger" || mem_class == "text-danger"){
      error_nodes += str
    } else {
      warning_nodes += str
    }
    return str;
  }`
  document.body.appendChild(parser);
};
