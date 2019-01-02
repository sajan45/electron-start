window.onload = function() {
  var parser = document.createElement('script');
  parser.text = `
  messages = {"errors": [], "warnings": []};
  message = "";
  error_nodes = "";
  warning_nodes = "";
  function scrap(){
    servers = $('.list-group .list-group-item');

    // all servers
    $.each(servers, function(_i, server){
      server_data = $(server).find('.list-group-item-text').find('.row')
      var name = $(server_data[0]).children(":eq(0)").text().trim().replace('.maropost.com','').replace(/\\d{6}-/,'');
      var stats = $(server_data[1]);

      var lag_elem = $(stats.children(":eq(0)"));
      var load_elem = $(stats.children(":eq(1)"));
      var mem_elem = $(stats.children(":eq(3)"));
      var disk_elem = $(stats.children(":eq(2)"));

      var lag = parseFloat(lag_elem.clone().children().remove().end().text());
      var load = parseFloat(load_elem.children(":eq(1)").text());
      var mem_per = parseFloat(mem_elem.children(":eq(1)").text());
      var disk_per = parseFloat(disk_elem.children(":eq(1)").text());

      var lag_class = lag_elem.attr("class").split(" ")[1] || "";
      var load_class = load_elem.attr("class").split(" ")[1] || "";
      var mem_class = mem_elem.attr("class").split(" ")[1] || "";
      var disk_class = disk_elem.attr("class").split(" ")[1] || "";

      // red alert for memory usage more than 90%
      if(mem_per <= 90 && mem_class == "text-danger"){
        mem_class = "text-warning";
      }

      // DB servers RAM usage is normally high so ignoring it
      if(name.match(/db|ftp|sms|fields|tables|clicks|sends|contacts|opens|cloud2|mysql/i)){
        mem_class = ""
      }

      // Mailers load is usually OK, upto 25-50
      if(name.match(/mailer/i)){
        load_class = ""
      }

      if(disk_per < 90){
        disk_class = ""
      }

      // ignoring loads below 10 for all but master dbs where it is required to be more than 20
      if (name.match(/app-db-master|cloud-db-master|app-workers-02|app-workers-06|cloud-workers-02|cloud-workers-04|injection/i)) {
        if(load < 25.0 && load_class == "text-danger") {
          load_class = "text-warning"
        }
      } else if(load < 10.0 && load_class == "text-danger") {
        load_class = "text-warning"
      }
      if(load_class == "text-danger" || mem_class == "text-warning" || mem_class == "text-danger" || disk_class == "text-danger"){
        message = name + " => "
        message += load + "  "
        message += mem_per + "  "
        message += disk_per + "  "
        if(load_class == "text-danger" || mem_class == "text-danger" || disk_class == "text-danger"){
          messages.errors.push(message)
        } else {
          messages.warnings.push(message)
        }
        createNode(name, "", load, mem_per, disk_per, "", load_class, mem_class, disk_class)
      }
      if(lag > 100.0){
        message = name + " lag => "
        message += lag + "  "
        messages.errors.push(message)
        createNode(name, lag, "", "", "text-danger", "", "")
      }
    })
    
    return [error_nodes,warning_nodes,messages];
  }
  function createNode(name, lag, load, memory, disk_per, lag_class, load_class, mem_class, disk_class){
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

    if(disk_class){
      str += '<td class="'+disk_class+'">'+disk_per+"</td>"
    } else {
      str += "<td>"+disk_per+"</td>"
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
