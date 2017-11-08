window.onload = function() {
  var parser = document.createElement('script');
  parser.text = `
  window.$ = window.jQuery = require("jquery");
  messages = [];
  message = "";
  nodes = ""
  function scrap(){
    $("#tabs").remove();
    // workers memory usage and load
    workers = $("table#servers tr").slice(87)
    $.each(workers, function(_i, server){
      var name = $(server).children("td:eq(0)").html();
      var load = $(server).children("td:eq(2)")
      var mem_per = $(server).children("td:eq(3)")
      if(($(load).attr("class") == "warning" || $(load).attr("class") == "error") || ($(mem_per).attr("class") == "warning" || $(mem_per).attr("class") == "error")){
        message = name + " => "
        message += $(load).html() + "  "
        message += $(mem_per).html() + "  "
        messages.push(message)
        node = createNode(name, "", $(load).html(), $(mem_per).html(), "", $(load).attr("class"), $(mem_per).attr("class"))
        nodes += node
      }
    })
    // Load on DB 1. should be less than 10
    db_1 = $("table#servers tr").slice(54,55)
    load = parseFloat($(db_1).children(":eq(2)").html())
    load_class = $(db_1).children(":eq(2)").attr("class")
    if(load > 10.0){
      message = "DB1 load => "
      message += load + "  "
      messages.push(message)
      node = createNode("DB1 load", "", load, "", "", load_class, "")
      nodes += node
    }
    // rest of the servers
    servers = $("table#servers tr").slice(1,86)
    $.each(servers, function(_i, server){
      var name = $(server).children("td:eq(0)").html();
      var load = $(server).children("td:eq(2)")
      var mem_per = $(server).children("td:eq(3)")
      var load_class = $(load).attr("class")
      var mem_class = $(mem_per).attr("class")
      // DB servers RAM usage is normally high so ignoring it
      if(name.match(/db|ftp|sms/i)){
        mem_class = ""
      }
      // Injections and Mailers load is usually ok upto 25-50
      if(name.match(/injection|mailer/i)){
        load_class = ""
      }
      if((load_class == "warning" || load_class == "error") || (mem_class == "warning" || mem_class == "error")){
        message = name + " => "
        message += $(load).html() + "  "
        message += $(mem_per).html() + "  "
        messages.push(message)
        node = createNode(name, "", $(load).html(), $(mem_per).html(), "", load_class, mem_class)
        nodes += node
      }
    })
    // Lag on any DB should be less than 100
    all_db = $("table#servers tr").slice(30,57)
    $.each(all_db, function(_i, server){
      var name = $(server).children("td:eq(0)").html();
      lag = parseFloat($(server).children(":eq(1)").html())
      lag_class = $(server).children(":eq(1)").attr("class")
      if(lag > 100.0){
        message = name + " lag => "
        message += lag + "  "
        messages.push(message)
        node = createNode(name, lag, "", "", lag_class, "", "")
        nodes += node
      }
    })
    return [nodes,messages];
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
    return str;
  }`
  document.body.appendChild(parser);
};
