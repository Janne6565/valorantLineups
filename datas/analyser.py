from tkinter import Tk
import json 

def copy(stringg): 
    r = Tk()
    r.withdraw()
    r.clipboard_clear()
    r.clipboard_append(stringg)
    r.update() # now it stays on the clipboard after the window is closed
    r.destroy()

def getMap(name):
    file = open("./datas/maps.json", "r")
    maps = json.load(file)
    file.close() 
    
    for map in maps["data"]:
        if map["name"] == name:
            return map

def getMaps():
    file = open("./datas/maps.json", "r")
    maps = json.load(file)
    file.close() 

    string = ""
    for map in maps["data"]: 
        displayName = map["displayName"]
        splash = map["splash"]
        listViewIcon = map["listViewIcon"]
        displayIcon = map["displayIcon"]
        
        plantSpots = 0
        try:
            for callout in map["callouts"]:
                if callout["regionName"] == "Site":
                    plantSpots += 1
        except:
            pass
        
        string += "INSERT INTO Maps (Name, PlantSpots, MapImagePath, MapPreviewImage, Splash) VALUES ('{}', {}, '{}', '{}', '{}');\n".format(displayName, plantSpots, displayIcon, listViewIcon, splash)

def getAgents(): 
    file = open("./datas/agents.json", "r")
    agents = json.load(file)
    file.close()

    roles = {}
    agentss = []
    string = ""
    for agent in agents["data"]:
        displayName = agent["displayName"]
        displayIcon = agent["displayIcon"]
        role = agent["role"]["uuid"]
        roles[agent["role"]["uuid"]] = agent["role"]
        bustPortaitPath = agent["bustPortrait"]
        agentss.append([displayName, role, displayIcon, bustPortaitPath])

    for agent in agentss:
        displayName = agent[0]
        displayIcon = agent[2]
        bustPortaitPath = agent[3]
        index = 0
        for role in roles:
            if role == agent[1]:
                role = index
                break
            index += 1


        if (displayName == "Deadlock"):
            string += "INSERT INTO Agents (Name, RoleId, DisplayIconPath, BustPortraitPath) VALUES ('{}', {}, '{}', '{}');\n".format(displayName, role, displayIcon, bustPortaitPath)

    print(string)

    string = ""
    for role in roles: 
        displayName = roles[role]["displayName"]
        displayIcon = roles[role]["displayIcon"]
        description = roles[role]["description"]
        string += "INSERT INTO Roles (Name, IconPath, Description) VALUES ('{}', '{}', '{}');\n".format(displayName, displayIcon, description)

    index = 1
    string = ""
    mapAbilitys = {
        "Ability1": "Q",
        "Ability2": "E",
        "Grenade": "C",
        "Ultimate": "X"
    }
    for agent in agents["data"]:
        abilitys = agent["abilities"]    

        for ability in abilitys:
            if ability["slot"] == "Passive":
                continue
            slot = mapAbilitys[ability["slot"]]
            
            displayName = ability["displayName"].replace("'", "")
            description = ability["description"].replace("'", "")
            displayIcon = ability["displayIcon"]
            
            if (agent["displayName"] == "Deadlock"):
                string += "INSERT INTO Abilitys (AgentId, Slot, Name, IconPath, Description) VALUES ({}, '{}', '{}', '{}', '{}');\n".format(index, slot, displayName, displayIcon, description)
        index += 1

    print(string)


getAgents()
