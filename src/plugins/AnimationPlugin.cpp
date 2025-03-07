#include "plugins/AnimationPlugin.h"
#include "esp_heap_caps.h"

void AnimationPlugin::setup()
{
    this->step = 0;
    if (customAnimationFrames.size() == 0)
    {
        Screen.setPixel(7, 4, 1);
        Screen.setPixel(8, 4, 1);
        Screen.setPixel(7, 5, 1);
        Screen.setPixel(8, 5, 1);
        Screen.setPixel(7, 6, 1);
        Screen.setPixel(8, 6, 1);
        Screen.setPixel(7, 7, 1);
        Screen.setPixel(8, 7, 1);
        Screen.setPixel(7, 8, 1);
        Screen.setPixel(8, 8, 1);

        Screen.setPixel(7, 10, 1);
        Screen.setPixel(8, 10, 1);
        Screen.setPixel(7, 11, 1);
        Screen.setPixel(8, 11, 1);
    }
}

void AnimationPlugin::loop()
{
    int size = customAnimationFrames.size();

    if (size > 0)
    {
        Serial.println("**************************************************");
        Serial.println("Current Screen: " + String(this->step));

        for (int i = 0; i < customAnimationFrames[this->step].size(); i++)
        {
            Serial.println("Pixel Index: " + String(i) + " Value: " + String(customAnimationFrames[this->step][i]));
            Screen.setPixelAtIndex(i, 1, (int) customAnimationFrames[this->step][i]);
        }

        this->step++;

        if (this->step >= size)
        {
            this->step = 0;
        }
        delay(400);
        // Debugging memory 
        Serial.println("**************************************************");
        multi_heap_info_t info;
        heap_caps_get_info(&info, MALLOC_CAP_INTERNAL | MALLOC_CAP_8BIT); // internal RAM, memory capable to store data or to create new task
        Serial.println("Total currently free in all non-continues blocks");
        Serial.println(info.total_free_bytes);
        Serial.println("Minimum free ever");
        Serial.println(info.minimum_free_bytes);
        Serial.println("Largest continues block to allocate big array");
        Serial.println(info.largest_free_block);
        
        // Clear storage to prevent crash
        storage.begin("led-wall", false);
        storage.clear();
        storage.end();
    }
}

void AnimationPlugin::websocketHook(DynamicJsonDocument &request)
{
    Serial.println("*************** Request Received ***********************************");
    const char *event = request["event"];
    Serial.println(event);
    if(!strcmp(event, "AnimationReset"))
    {
        customAnimationFrames.clear();
        int size = (int)request["screens"];
        Serial.println(size);
        customAnimationFrames.resize(size);
    }
    else if(!strcmp(event, "upload"))
    {
        Serial.println("Upload screen event received");
        int screenIndex = (int)request["screenIndex"];
        Serial.println("Screen Index: " + String(screenIndex));
        // Get screen values into animation vector
        for (int k = 0; k < 256; k++)
        {
            if (k == 0)
            {
                customAnimationFrames[screenIndex].resize(256);
            }
            customAnimationFrames[screenIndex][k] = (int)request["data"][k];
        }
    }
}

const char *AnimationPlugin::getName() const
{
    return "Animation";
}
