```    
      _____                   _______                   _____                    _____          
     /\    \                 /::\    \                 /\    \                  /\    \         
    /::\    \               /::::\    \               /::\    \                /::\____\        
    \:::\    \             /::::::\    \             /::::\    \              /::::|   |        
     \:::\    \           /::::::::\    \           /::::::\    \            /:::::|   |        
      \:::\    \         /:::/~~\:::\    \         /:::/\:::\    \          /::::::|   |        
       \:::\    \       /:::/    \:::\    \       /:::/__\:::\    \        /:::/|::|   |        
       /::::\    \     /:::/    / \:::\    \     /::::\   \:::\    \      /:::/ |::|   |        
      /::::::\    \   /:::/____/   \:::\____\   /::::::\   \:::\    \    /:::/  |::|   | _____  
     /:::/\:::\    \ |:::|    |     |:::|    | /:::/\:::\   \:::\____\  /:::/   |::|   |/\    \ 
    /:::/  \:::\____\|:::|____|     |:::|    |/:::/  \:::\   \:::|    |/:: /    |::|   /::\____\
   /:::/    \::/    / \:::\    \   /:::/    / \::/   |::::\  /:::|____|\::/    /|::|  /:::/    /
  /:::/    / \/____/   \:::\    \ /:::/    /   \/____|:::::\/:::/    /  \/____/ |::| /:::/    / 
 /:::/    /             \:::\    /:::/    /          |:::::::::/    /           |::|/:::/    /  
/:::/    /               \:::\__/:::/    /           |::|\::::/    /            |::::::/    /   
\::/    /                 \::::::::/    /            |::| \::/____/             |:::::/    /    
 \/____/                   \::::::/    /             |::|  ~|                   |::::/    /     
                            \::::/    /              |::|   |                   /:::/    /      
                             \::/____/               \::|   |                  /:::/    /       
                              ~~                      \:|   |                  \::/    /        
                                                       \|___|                   \/____/         
```
## TORN(Task ORchestration eNgine)
TORN is a... well, a task orchestration engine, that let's you add jobs to a queue and executes them for you.
 
You can use the workers to queue jobs into a redis set and the workers will recursively process them.<br> 
*TORN will be pakaged as an SDK and will be deployed to use with npm in the future*<br><br>
TORN MVP as of 14-06-2025 includes
- REST API for enqueueing jobs
- REST API for getting job health
- worker method to process jobs
- Executioner to execute each job and return structured results
- Currently TORN only supports shell command based jobs 

<pre lang="markdown">payload: {
    type: 'command',                         //only option as of now
    command: --shell command to execute--    //example: echo
    args: --array of arguments--             //example: ['hello', 'world']
}</pre>

On successfull completion of the job, the logger would print:
<pre lang="markdown">
{   
    success: true,
    output: 'hello world',
    error: null
}
</pre>

TORN also supports 
{( ONE SHOULD NOTE THAT THESE ARE BEING BUILT RIGHT NOW)}
- retries with optional backoff
- metrics logging for each jobs
- dead letter queue for failed jobs
- concurrency using p-queues

These are currently being worked on and will be available for TORN-v1.0.0

