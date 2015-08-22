import java.io.*;
import java.util.*;
import java.nio.charset.*;
import edu.stanford.nlp.ling.*;
import edu.stanford.nlp.pipeline.*;
import edu.stanford.nlp.util.*;
import edu.stanford.nlp.ling.CoreAnnotations.*;
import edu.stanford.nlp.dcoref.*;
import edu.stanford.nlp.dcoref.CorefCoreAnnotations.*;
import edu.stanford.nlp.dcoref.CorefChain.CorefMention;
public class T {
	final static Charset ENCODING = StandardCharsets.UTF_8;
	
	public static void main(String[] args) throws IOException {
	//Environment setting of StanfordNLP
	    Properties props = new Properties();
	    props.setProperty("annotators", "tokenize, ssplit, pos, lemma, ner, parse, dcoref");
	    StanfordCoreNLP pipeline = new StanfordCoreNLP(props);
	    
	    //Load file
	    String text = "";
	    if (args[0] != null){
	    	File inputFile = new File(args[0]);
	    	Scanner sc = new Scanner(inputFile,ENCODING.name());        
	    	StringBuilder sb = new StringBuilder();
	    	while(sc.hasNextLine()){
	    		String line = sc.nextLine();
	    		sb.append(line);
	    	}
	    	sc.close();
	    	text = sb.toString();
	    }
	    else
	    	text = "No input found. This is a sentence. This is Mary Jassica. I know her when I met John Denver.";
	    
	    //Remove brackets
	    int left = 0, right = 0;
	    char[] charList = text.toCharArray();
	    StringBuffer temp = new StringBuffer();
	    for (char i: charList){
	    	if (i == '(' || i == '['){
	    		left ++;
	    		continue;
	    	}
	    	else if (i == ')' || i == ']'){
	    		right ++;
	    		continue;
	    	}
	    	if (left == right)
	    		temp.append(i);
	    }
	    text = temp.toString();
	    			
	    Annotation document = new Annotation(text);
	    pipeline.annotate(document);
	    
	    //Process Coreference
	    Map<Integer, CorefChain> coref = document.get(CorefChainAnnotation.class);	    
	    Stack<Set<IntPair>> corefInformation = new Stack<Set<IntPair>>();
	    for(Map.Entry<Integer, CorefChain> entry : coref.entrySet()) {
	          CorefChain c =   entry.getValue();
	          //System.out.println(c);
	          Map<IntPair,Set<CorefMention>> cm = c.getMentionMap();
	          Set<IntPair> corefIndex = cm.keySet();
	          corefInformation.push(corefIndex);
	    }
	    
	    //Process NER, POS, Token
	    TreeMap<IntPair, String> posMap= new TreeMap<IntPair, String>();
	    TreeMap<IntPair, String> nerMap= new TreeMap<IntPair, String>();
	    TreeMap<IntPair, String> tokenMap= new TreeMap<IntPair, String>();	    
	    List<CoreMap> sentences = document.get(SentencesAnnotation.class);
	    
	    int sentenceIndex = 1;
	    for(CoreMap sentence: sentences) {
	    	int tokenIndex = 1;
	    	for (CoreLabel token: sentence.get(TokensAnnotation.class)) {
	    		IntPair tokenKey = new IntPair(sentenceIndex, tokenIndex);
	    		String word = token.get(TextAnnotation.class);
	    		String pos = token.get(PartOfSpeechAnnotation.class);
	    		String ner = token.get(NamedEntityTagAnnotation.class);
	    		posMap.put(tokenKey, pos);
	    		nerMap.put(tokenKey, ner);
	    		tokenMap.put(tokenKey, word);
	    		tokenIndex++;
	    	}
	    	sentenceIndex++;
	    }
	    System.out.print(tokenMap);
	    
	    StringBuilder nameBuffer = new StringBuilder();
	    IntPair locationBuffer = new IntPair();
	    int nameLength = 0;
	    for(Map.Entry<IntPair, String> entry: nerMap.entrySet()){
	    	String value = entry.getValue();
	    	if (!value.equals("PERSON") && nameBuffer.length() !=0){
	    		tokenMap.put(locationBuffer, nameBuffer.toString());
	    		nameBuffer.setLength(0);
	    		nameLength = 0;
	    	}
	    	else if (value.equals("PERSON")){
	    		IntPair currentLocation = entry.getKey();
	    		if (nameLength > 0){
	    		nameBuffer.append(' ');
	    		}
	    		nameBuffer.append(tokenMap.get(currentLocation));
	    		nameLength++;
	    		if (nameLength > 1){
	    			tokenMap.put(locationBuffer, "??!!--");
	    		}
	    		locationBuffer = currentLocation;
	    	}	    	
	    }	    
	    //System.out.println(tokenMap);
	    
	    //Perform replacement
	    for (Set<IntPair> mentions: corefInformation){
	    	if (mentions.size() > 1){
	    		String name = "";
	    		for (IntPair mentionLocation: mentions){
	    			String candidate = nerMap.get(mentionLocation);
	    			if (candidate.equals("PERSON"))
	    				name = tokenMap.get(mentionLocation);
	    		}
	    		if (!name.equals("")){
	    			for (IntPair mentionLocation: mentions){
	    				String POSTagger = posMap.get(mentionLocation);
	    				if (POSTagger.equals("PRP"))
	    					tokenMap.put(mentionLocation, name);
	    				if (POSTagger.equals("PRP$")){
	    					String replacement = name + "'s";
	    					tokenMap.put(mentionLocation, replacement);
	    				}
		    		}
	    		}	    		
	    	}
	    }
	    
	    System.out.println(corefInformation);
	    //System.out.println(nerMap);
	    //System.out.println(posMap);
	    //System.out.println(tokenMap);
	    
	    
	    //Write file
	    StringBuilder output = new StringBuilder();
	    for (String token: tokenMap.values()){
	    	if (!token.equals("??!!--")){
	    		if (token.matches("^[a-zA-Z0-9_]+$")){
	    			output.append(" ");
	    			output.append(token);
	    		}
	    		else if (token.equals(".") || token.equals(","))
	    			output.append(token);
	    		else if (token.matches("(.*).(.*)")){
	    			output.append(" ");
	    			StringBuilder separation = new StringBuilder();
	    			char[] charSeparation = token.toCharArray();
	    			int blankMark = 0;
	    			for (int i = 0; i< charSeparation.length - 1; i++){
	    				char current = charSeparation[i];
	    				if (blankMark == 1 && current == ' '){
	    					separation.append(current);
	    					blankMark = 0;
	    				}
	    				else if (blankMark == 1){
	    					separation.append(" ");
	    					separation.append(current);
	    					blankMark = 0;
	    				}
	    				else if (current == '.'){
	    					separation.append(current);
	    					blankMark = 1;
	    				}
	    				else
	    					separation.append(current);	    				
	    			}
	    			separation.append(charSeparation[charSeparation.length - 1]);
	    			output.append(separation.toString());
	    		}
	    		else 
	    			output.append(token);
	    	}
	    }
	    String outputFile = output.toString();
	    PrintWriter outputWriter = new PrintWriter("filtered.txt");
	    outputWriter.print(outputFile);
	    outputWriter.close();
	    
	    System.out.print("Finished");
	}
}
