import {useState,useEffect}from "react"
import TodoList from "../components/TodoList"
import ConnectWalletButton from "../components/ConnectWalletButton"
import WrongNetworkMessage from "../components/WrongNetworkMessage"
import TaskAbi from "../../todo-app-blockchain-backend/build/contracts/TaskContract.json"
import {TaskContractAddress} from "../config";
import {ethers}from "ethers"
export default function Home() {

  const[correctNetwork,setCorrectNetwork]=useState(false);
  const[isUserLoggedIn,setIsUserLoggedIn]=useState(false);
  const[currentAccount,setCurrentAccount]=useState('');
  const[input,setInput]=useState('')
  const[tasks,setTasks]=useState([])

  useEffect(()=>{
   connectWallet()
   getAllTasks()
  },[])
  const connectWallet=async()=>{
    try{
      const{ethereum}=window
      if(!ethereum){
        console.log("Metamask not detected")
        return
      }
      let chainId=await ethereum.request({method:"eth_chainId"})
      console.log("connected to chain",chainId);
      const rinkebyChainId='0x4'
      if(chainId!==rinkebyChainId){
        alert("you are not connected  to the rinkeby testnet!")
        setCorrectNetwork(false);
        return 
      }else{
       setCorrectNetwork(true)

      }
      const accounts=await ethereum.request({method:'eth_requestAccounts'})
      console.log("Found account",accounts[0])
      setIsUserLoggedIn(true)
      setCurrentAccount(accounts[0])
    }catch(error){
      console.log(error);
    }
  }
  const getAllTasks=async(e)=>{
    try{
      if(ethereum){
        const provider=new ethers.providers.Web3Provider(ethereum)
        const signer=provider.getSigner()
        const TaskContract=new ethers.Contract(TaskContractAddress,TaskAbi.abi,signer)
        let allTasks=await TaskContract.getMyTasks()
        setTasks(allTasks)
      }else{
        console.log("ethereum object does not exist")
      }
    
    }catch(error){
      console.log(error)
    }
  }
  const addTask=async(e)=>{
    e.preventDefault()
    let task={
     taskText:input,
     isDeleted:false,
    }
    try{
      const {ethereum}=window
      if(ethereum){
       const provider=new ethers.providers.Web3Provider(ethereum)
       const signer=provider.getSigner()
       const TaskContract=new ethers.Contract(TaskContractAddress,TaskAbi.abi,signer)
       TaskContract.addTask(task.taskText,task.isDeleted)
      .then(res=>{
        setTasks([...tasks,task])
      })
      .catch(err=>{
        console.log(err)
      })

      }else{
        console.log("ethreum object does not exist!")
      }
    }catch(error){
     console.log(error)
    }

  }
  const deleteTask=async(key)=>{
    const {ethereum}=window
    try{
     if(ethereum){
      const provider=new ethers.providers.Web3Provider(ethereum)
      const signer=provider.getSigner()
      const TaskContract=new ethers.Contract(TaskContractAddress,TaskAbi.abi,signer)
    const deleteTaskTx=  await TaskContract.deleteTask(key,true)
    console.log('successfully deleted:',deleteTask)
    let allTask=await TaskContract.getMyTasks()
    setTasks(allTask)
     }else{
      console.log("ethreum object does not exist!")
     }
    }catch(error){
      console.log(error)
    }
  }
  return (
    <div>
       {
        !isUserLoggedIn?<ConnectWalletButton connectWallet={connectWallet}/>
        :correctNetwork?<TodoList tasks={tasks} input={input} setInput={setInput} addTask={addTask} deleteTask={deleteTask}/>:<WrongNetworkMessage/>
       }
    </div>
  )
}
