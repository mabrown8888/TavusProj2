1. Open Terminal on your Mac                                                  
  2. mkdir CodeProjActing                                                       
  3. cd CodeProjActing                                                          
                                                                                
  # Install Homebrew (Mac package manager) if you don't have it:                
  4. /bin/bash -c "$(curl -fsSL                                                 
  https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"          
                                                            
  # Install Git and Node.js:                                                    
  5. brew install git node                                  
                                                                                
  # Clone the repo:                                         
  6. git clone https://github.com/mabrown8888/TavusProj2.git
  7. cd TavusProj2                                                              
   
  # Install dependencies:                                                       
  8. npm install                                            

  # Create your .env file with your API keys:                                   
  9. cp .env.example .env   ← (see note below)
     — or create .env manually with these keys:                                 
                                                                                
     VITE_TAVUS_API_KEY=your_tavus_key                                          
     VITE_REPLICA_ID=your_replica_id                                            
     VITE_ANTHROPIC_API_KEY=your_anthropic_key                                  
                                                                                
  # Run the app:                                                                
  10. npm run dev                                                               
                                                                                
  # Open in browser:                                        
  11. http://localhost:5173
