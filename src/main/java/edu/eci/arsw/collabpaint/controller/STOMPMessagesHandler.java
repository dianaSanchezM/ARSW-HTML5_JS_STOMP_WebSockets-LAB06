/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.eci.arsw.collabpaint.controller;

import edu.eci.arsw.collabpaint.model.Point;
import java.util.ArrayList;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

/**
 *
 * @author diana
 */
@Controller
public class STOMPMessagesHandler {
    
    @Autowired
    SimpMessagingTemplate msgt;
    
    private Map<String, ArrayList<Point>> map = new ConcurrentHashMap<>();

    @MessageMapping("newpoint.{numdibujo}")    
    public void handlePointEvent(Point pt,@DestinationVariable String numdibujo) throws Exception {
            System.out.println("Nuevo punto recibido en el servidor!:"+pt);
            msgt.convertAndSend("/topic/newpoint."+numdibujo, pt);
            ArrayList<Point> list= new ArrayList<>();
            if (map.containsKey(numdibujo)){
                list=map.get(numdibujo);
                list.add(pt);
                map.put(numdibujo, list);
                if (list.size()==4){
                    msgt.convertAndSend("/topic/newpolygon."+numdibujo, list);
                }else if ((list.size()%4)==0){
                    msgt.convertAndSend("/topic/newpolygon."+numdibujo, list.subList(list.size()-4, list.size()));
                }
            }else{
                list.add(pt);
                map.putIfAbsent(numdibujo, list);
            }
    }
}