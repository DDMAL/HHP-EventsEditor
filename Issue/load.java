import java.io.*;
import java.util.*;

public class LoadExtraction {
	final static String[] locationMark = {"l:in", "l:at", "l:on", "l:from"};
	final static String[] timeMark = {"t:in", "t:at", "t:on", "t:from", "t:during", "t:between",
		"t:before", "t:after", "t:while", "t:when"};

	public static void main(String[] args) throws IOException{
		//Read output of extraction
		FileInputStream fstream = new FileInputStream(args[0]);
		DataInputStream input = new DataInputStream(fstream);
		BufferedReader reader = new BufferedReader(new InputStreamReader(input));
		ArrayList<String> outputLines= new ArrayList<String>();
		String readLine;
		while ((readLine = reader.readLine()) != null){
			outputLines.add(readLine);
		}
		input.close();
		
		//Process output of extraction
		ArrayList<String> loadLines = new ArrayList<String>();
		int extractionCandidate = 0;
		ArrayList<String> sentenceExtraction = new ArrayList<String>();
		for (String line: outputLines){
			if (line.equals("")){
				if (extractionCandidate == 1){
				  	for (String i: sentenceExtraction){
				  		loadLines.add(i);
					}
				}
				extractionCandidate = 0;
				sentenceExtraction.clear();
			}
			else{
				if (Character.isDigit(line.charAt(0))){
					extractionCandidate = 1;
					String content = "";
					if (line.charAt(5) != '('){
						int markPoint = line.indexOf('(');
						String keyWord = line.substring(5,markPoint);
						int startPoint = line.indexOf(':') + 2;
						content = '(' + keyWord + ')' + line.substring(startPoint, line.length() - 1);
					}
					else
						content = line.substring(6, line.length() - 1);
					String[] preLoadLine = content.split("; ");
					ArrayList<String> loadLine = new ArrayList<String>();
					loadLine.addAll(Arrays.asList(preLoadLine));
					if (loadLine.size() >= 3){
						loadLine = processTuple(loadLine);
						sentenceExtraction.addAll(loadLine);
					}			  					
				}
			}
		}
		PrintWriter outputWriter = new PrintWriter("extraction.txt");
		for (String i: loadLines){
			outputWriter.print(i);
			outputWriter.print('\n');
		}
	    outputWriter.close();	    
	    System.out.print("Finished");
	}
	
	private static String processTimeLocation(ArrayList<String> conditionList, char Mark, String conditionBuffer){
		if (conditionList.size() ==0)
			return conditionBuffer;
		else{
			String condition = conditionList.get(0);
			conditionList.remove(0);
			char[] conditionChar = condition.toCharArray();
			String[] conditionWord = condition.split(" ");
			if (conditionChar[0] == 'L' && conditionChar[1] == ':'){
				if (Collections.frequency(Arrays.asList(locationMark), conditionWord[0].toLowerCase()) == 0){
					char[] prepositionChar = Arrays.copyOfRange(conditionChar, 2, conditionWord[0].length());
					String prepositionWord = new String(prepositionChar);
					List<String> joined = new ArrayList<String>();
					joined.add(prepositionWord);
					joined.addAll(Arrays.asList(Arrays.copyOfRange(conditionWord, 1, conditionWord.length)));
					conditionBuffer += " in " + String.join(" ", joined);
					return processTimeLocation(conditionList, 'L', conditionBuffer);
					}
				else{
					char[] prepositionChar = Arrays.copyOfRange(conditionChar, 2, conditionWord[0].length());
					String prepositionWord = new String(prepositionChar);
					List<String> joined = new ArrayList<String>();
					joined.add(prepositionWord);
					joined.addAll(Arrays.asList(Arrays.copyOfRange(conditionWord, 1, conditionWord.length)));
					conditionBuffer += " " + String.join(" ", joined);
					return processTimeLocation(conditionList, 'L', conditionBuffer);
					}
				}
			else if (conditionChar[0] == 'T' && conditionChar[1] == ':'){
				if (Collections.frequency(Arrays.asList(timeMark), conditionWord[0].toLowerCase()) != 0){
					char[] processedChar = Arrays.copyOfRange(conditionChar, 2, conditionWord[0].length());
					String processedWord = new String(processedChar);
					List<String> joined = new ArrayList<String>();
					joined.add(processedWord.toLowerCase());
					joined.addAll(Arrays.asList(Arrays.copyOfRange(conditionWord, 1, conditionWord.length)));
					conditionBuffer += " " + String.join(" ", joined);
					return processTimeLocation(conditionList, 'T', conditionBuffer);
					}
				else if (Mark == 'T' && Collections.frequency(Arrays.asList(timeMark), conditionWord[0].toLowerCase()) == 0){
					char[] prepositionChar = Arrays.copyOfRange(conditionChar, 2, conditionWord[0].length());
					String processedWord = new String(prepositionChar);
					List<String> joined = new ArrayList<String>();
					joined.add(processedWord.toLowerCase());
					joined.addAll(Arrays.asList(Arrays.copyOfRange(conditionWord, 1, conditionWord.length)));
					conditionBuffer += " " + String.join(" ", joined);
					return processTimeLocation(conditionList, 'T', conditionBuffer);
					}
				else{
					conditionBuffer += " in " + String.join(" ", conditionWord);
					return processTimeLocation(conditionList, 'T', conditionBuffer);
					}
				}
			else{
				conditionBuffer += " " + condition;
				return processTimeLocation(conditionList, 'N', conditionBuffer);
			}
		}
	}

	private static ArrayList<String> processTuple(ArrayList<String> loadList){
		ArrayList<String> output = new ArrayList<String>();
		output.add(loadList.get(0));
		loadList.remove(0);
		output.add(loadList.get(0));
		loadList.remove(0);
		String objectBuffer = loadList.get(0);
		loadList.remove(0);
		char[] objectChar = objectBuffer.toCharArray();
		char Mark = 'N';
		if (objectChar[0] == 'T' && objectChar[1] == ':'){
			Mark = 'T';
			char[] temp = Arrays.copyOfRange(objectChar, 2, objectChar.length);
			objectBuffer = new String(temp);
			}
		if (objectChar[0] == 'L' && objectChar[1] == ':'){
			Mark = 'L';
			char[] temp = Arrays.copyOfRange(objectChar, 2, objectChar.length);
			objectBuffer = new String(temp);
			}
		String condition = processTimeLocation(loadList, Mark, "");
		output.add(objectBuffer + condition);
		return output;
	}
					 

}
