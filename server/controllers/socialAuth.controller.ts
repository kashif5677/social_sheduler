import { Request, Response } from "express";
import zernio from "../config/zernio.js";
import { User } from "../models/User.js";

//Helper to ensure user has a Zernio Profile
const getOrCreteZernioProfile=async(user:any):Promise<string>{
    try {
        const result= await zernio.profiles.listProfiles()
        const data=result.data as any
        const profiles:any[]=Array.isArray(data)? data:data?.profiles || data?.data || []

        if(profiles.length >0){
            const pid=profiles[0]._id || profiles[0].id
            await User.findByIdAndUpdate(user._id),{zernioProfileId:pid}
            return pid
        }

        const createResult=await zernio.profiles.createProfile({
            body:{name:`${user.name || user.email}'s workspace`} as any
        })
        const created=(createResult.data as any)?.profile || createResult.Database

        const pid=created?._id || created?.id;

        if(!pid){
            throw new Error("fialed to create Zernio profile -no ID returned")
        }

        await User.findByIdAndUpdate(user._id,{zernioProfileId:pid})
        return pid;

    } catch(error:any) {
        console.log("getOrCreatedZernioProfile Error:",error?.message || error);
        throw error
    }
}

//Generate OAuth authorization URL
//GET /api/auth/:platform
export const generateAuthUrl = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { platform } = req.params;
    const profileId=await getOrCreteZernioProfile(req.user);

    const origin =req.headers.origin
    const redirectUrl=`${origin}/accounts`

    const result=await zernio.connect.getConnectUrl({
        path:{platform:platform as any},
        query:{
            profileId,
            redirect_url:redirectUrl
        }
    })

    const data=result.data as any
    console.log("getConnextUrl response:",JSON.stringify(data,null,2))

    const authUrl=data.authUrl;
    if(!authUrl){
        throw new Error(`Zernio returned no authurl.Full response: ${JSON.stringify(data,null,2)}`)
    }

    res.json({url:authUrl})
  } catch (error:any) {
    res.status(500).json({message:error?.message || "Server error"})
  }
};

// Sync connected accounts from zernio into MongoDB
//GET/api/auth/sync
export const syncAccounts=async(req:Request,res:Response):Promise<void>=>{
    try {
        const profileId=await getOrCreteZernioProfile(req.user)
        const result
    } catch (error) {
        
    }
}

