#include "PluginManager.h"
#include "scheduler.h"

#ifdef ENABLE_SERVER

AsyncWebSocket ws("/ws");
// Buffer to store full message when fragmented
String messageBuffer = "";

void sendInfo()
{
  DynamicJsonDocument jsonDocument(6144);
  if (currentStatus == NONE)
  {
    for (int j = 0; j < ROWS * COLS; j++)
    {
      jsonDocument["data"][j] = Screen.getRenderBuffer()[j];
    }
  }

  jsonDocument["status"] = currentStatus;
  jsonDocument["plugin"] = pluginManager.getActivePlugin()->getId();
  jsonDocument["event"] = "info";
  jsonDocument["rotation"] = Screen.currentRotation;
  jsonDocument["brightness"] = Screen.getCurrentBrightness();
  jsonDocument["scheduleActive"] = Scheduler.isActive;

  JsonArray scheduleArray = jsonDocument.createNestedArray("schedule");
  for (const auto &item : Scheduler.schedule)
  {
    JsonObject scheduleItem = scheduleArray.createNestedObject();
    scheduleItem["pluginId"] = item.pluginId;
    scheduleItem["duration"] = item.duration / 1000; // Convert milliseconds to seconds
  }

  JsonArray plugins = jsonDocument.createNestedArray("plugins");

  std::vector<Plugin *> &allPlugins = pluginManager.getAllPlugins();
  for (Plugin *plugin : allPlugins)
  {
    JsonObject object = plugins.createNestedObject();

    object["id"] = plugin->getId();
    object["name"] = plugin->getName();
  }
  String output;
  serializeJson(jsonDocument, output);
  ws.textAll(output);
  jsonDocument.clear();
}

void sendMinimalInfo()
{
  DynamicJsonDocument jsonDocument(6144);

  jsonDocument["status"] = currentStatus;
  jsonDocument["plugin"] = pluginManager.getActivePlugin()->getId();
  jsonDocument["event"] = "minimal-info";
  jsonDocument["rotation"] = Screen.currentRotation;
  jsonDocument["brightness"] = Screen.getCurrentBrightness();
  jsonDocument["scheduleActive"] = Scheduler.isActive;

  String output;
  serializeJson(jsonDocument, output);
  ws.textAll(output);
  jsonDocument.clear();
}

void onWsEvent(
    AsyncWebSocket *server,
    AsyncWebSocketClient *client,
    AwsEventType type,
    void *arg,
    uint8_t *data,
    size_t len)
{
  Serial.println("*************** WS Received ***********************************");
  Serial.println("Type:" + String(type));
  if (type == WS_EVT_CONNECT)
  {
    sendInfo();
  }

  if (type == WS_EVT_DATA)
  {
    AwsFrameInfo *info = (AwsFrameInfo *)arg;
    Serial.println("info->final: " + String(info->final));
    Serial.println("info->index: " + String(info->index));
    Serial.println("info->len: " + String(info->len));
    Serial.println("info->opcode: " + String(info->opcode));

    if (info->final && info->index == 0 && info->len == len)
    {
      Serial.println("Received full single message");
      if (info->opcode == WS_BINARY && currentStatus == WSBINARY && info->len == 256)
      {
        Screen.setRenderBuffer(data, true);
      }
      else if (info->opcode == WS_TEXT)
      {
        data[len] = 0;
        
        DynamicJsonDocument wsRequest(6144);
        DeserializationError error = deserializeJson(wsRequest, data);

        if (error)
        {
          Serial.print(F("deserializeJson() failed: "));
          Serial.println(error.f_str());
          return;
        }
        else
        {
          pluginManager.getActivePlugin()->websocketHook(wsRequest);

          const char *event = wsRequest["event"];

          if (!strcmp(event, "plugin"))
          {
            int pluginId = wsRequest["plugin"];
            Scheduler.clearSchedule();
            pluginManager.setActivePluginById(pluginId);

            sendMinimalInfo();
          }
          else if (!strcmp(event, "persist-plugin"))
          {
            pluginManager.persistActivePlugin();
          }
          else if (!strcmp(event, "rotate"))
          {
            bool isRight = (bool)!strcmp(wsRequest["direction"], "right");
            Screen.setCurrentRotation((Screen.currentRotation + (isRight ? 1 : 3)) % 4, true);
          }
          else if (!strcmp(event, "info"))
          {
            sendInfo();
          }
          else if (!strcmp(event, "brightness"))
          {
            uint8_t brightness = wsRequest["brightness"].as<uint8_t>();
            Screen.setBrightness(brightness, true);
          }
        }
      }
    }
    else {
      if (info->index == 0) {
        messageBuffer = ""; // Clear buffer when starting new message
        Serial.println("Starting new message");
      }

      // Append part of message to buffer
      for (size_t i = 0; i < len; i++) {
        messageBuffer += (char)data[i];
      }
      // Deserialize Final Json
      DynamicJsonDocument wsRequest(6144);
      DeserializationError error = deserializeJson(wsRequest, messageBuffer);

      if (error)
      {
        Serial.print(F("deserializeJson() big JSON failed: "));
        Serial.println(error.f_str());
        return;
      }
      else
        {
          pluginManager.getActivePlugin()->websocketHook(wsRequest);
        }
    }
  }
}

void initWebsocketServer(AsyncWebServer &server)
{
  server.addHandler(&ws);
  ws.onEvent(onWsEvent);
}

void cleanUpClients()
{
  ws.cleanupClients();
}

#endif